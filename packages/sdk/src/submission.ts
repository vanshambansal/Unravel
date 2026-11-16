import {
  MAX_SUBMISSION_BYTES,
  ReportSubmissionSchema,
  SubmissionReceiptSchema,
  type Recording,
  type SubmissionReceipt,
} from '@unravel/contracts';

export type SubmissionState = {
  state: 'idle' | 'submitting' | 'submitted' | 'error';
  reportId: string | null;
  error: string | null;
};
/** Freeze the first envelope so retry cannot create a second report or silently change evidence. */
export function createSubmission(
  endpoint: string | undefined,
  notify?: (value: SubmissionState) => void,
  credentials: 'omit' | 'same-origin' = 'omit',
) {
  let state: SubmissionState = { state: 'idle', reportId: null, error: null };
  let pending: Promise<SubmissionReceipt> | null = null,
    controller: AbortController | null = null;
  let frozenBody: string | null = null,
    receipt: SubmissionReceipt | null = null,
    generation = 0;
  const update = (next: SubmissionState) => {
    state = next;
    try {
      notify?.({ ...next });
    } catch {
      /* Consumer UI must not break submission. */
    }
  };
  return {
    status: () => ({ ...state }),
    reset() {
      generation++;
      controller?.abort();
      controller = null;
      pending = null;
      frozenBody = null;
      receipt = null;
      state = { state: 'idle', reportId: null, error: null };
    },
    submit(recording: Recording, details: { title: string; description?: string }) {
      if (!endpoint)
        return Promise.reject(new Error('Configure submissionUrl before submitting a report.'));
      let address: URL;
      try {
        address = new URL(endpoint);
        if (
          !/^https?:$/.test(address.protocol) ||
          address.username ||
          address.password ||
          address.search ||
          address.hash
        )
          throw new Error();
      } catch {
        return Promise.reject(
          new Error('Use a full HTTP(S) submission URL without credentials, query or fragment.'),
        );
      }
      if (credentials === 'same-origin' && address.origin !== window.location.origin)
        return Promise.reject(
          new Error('Authenticated submissions must stay on the current origin.'),
        );
      const parsed = ReportSubmissionSchema.safeParse({
        version: 1,
        title: details.title.trim(),
        description: details.description?.trim() ?? '',
        recording,
      });
      if (!parsed.success)
        return Promise.reject(
          new Error(
            'Use a report title of 1–120 characters and description up to 2,000 characters.',
          ),
        );
      const body = JSON.stringify(parsed.data);
      if (new TextEncoder().encode(body).length > MAX_SUBMISSION_BYTES)
        return Promise.reject(
          new Error(
            'The complete report exceeds the 5 MB submission limit. Record a shorter session.',
          ),
        );
      if (frozenBody && frozenBody !== body)
        return Promise.reject(
          new Error('Retry with the same report details, or start a new recording.'),
        );
      if (receipt) return Promise.resolve({ ...receipt });
      if (pending) return pending;
      frozenBody = body;
      const ticket = ++generation;
      controller = new AbortController();
      const attemptController = controller;
      let timedOut = false;
      const timeout = setTimeout(() => {
        timedOut = true;
        attemptController.abort();
      }, 30000);
      update({ state: 'submitting', reportId: null, error: null });
      pending = (async () => {
        try {
          const response = await fetch(address, {
            method: 'POST',
            mode: 'cors',
            credentials,
            headers: { 'Content-Type': 'application/json' },
            body,
            signal: controller!.signal,
          });
          if (!response.ok)
            throw new Error(
              response.status === 413
                ? 'The server rejected this report as too large.'
                : response.status === 409
                  ? 'This recording ID already has different submitted content.'
                  : response.status === 403
                    ? 'This website origin is not registered for this project.'
                    : response.status === 429
                      ? 'Report submission is temporarily limited or project storage is full. Keep this recording; ask the developer or retry later.'
                      : response.status === 408
                        ? 'Report submission timed out. Keep this recording and retry.'
                        : response.status === 503
                          ? 'Report submission is unavailable. Keep this recording and retry later.'
                          : response.status === 422
                            ? 'The recording is incomplete or unsupported. Start a new recording.'
                            : 'Report submission failed. Retry with the same details.',
            );
          const value = SubmissionReceiptSchema.parse(await response.json());
          if (ticket !== generation) throw new Error('Submission cancelled.');
          receipt = value;
          update({ state: 'submitted', reportId: value.reportId, error: null });
          return { ...value };
        } catch (error) {
          const message = timedOut
            ? 'Report submission timed out. Retry with the same details.'
            : (error instanceof Error && error.message.startsWith('This ')) ||
                (error instanceof Error &&
                  /^(Report submission|The server|The recording)/.test(error.message))
              ? (error as Error).message
              : 'Could not reach the reporting service or confirm delivery. Check your connection or ask the developer to check the service, then retry.';
          if (ticket === generation) update({ state: 'error', reportId: null, error: message });
          // eslint-disable-next-line preserve-caught-error -- Network/parser causes can contain URLs or submitted data.
          throw new Error(message);
        } finally {
          clearTimeout(timeout);
          if (ticket === generation) {
            pending = null;
            controller = null;
          }
        }
      })();
      return pending;
    },
  };
}
