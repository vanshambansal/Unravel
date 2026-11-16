import type { NetworkEvent } from '@unravel/contracts';
import type { Privacy } from './privacy';
const method = (value: unknown): NetworkEvent['method'] =>
  typeof value === 'string' &&
  /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/.test(value.toUpperCase())
    ? (value.toUpperCase() as NetworkEvent['method'])
    : 'OTHER';
const elapsed = (start: number) => Math.max(0, Math.round(performance.now() - start));

/** Forward native requests unchanged; capture bounded metadata and restore only wrappers we still own. */
export function instrumentNetwork(
  privacy: Privacy,
  at: () => number,
  emit: (event: NetworkEvent) => void,
): () => void {
  let active = true;
  const originalFetch = window.fetch,
    prototype = XMLHttpRequest.prototype;
  const originalOpen = prototype.open,
    originalSend = prototype.send;
  const removeListeners = new Set<() => void>();
  const requests = new WeakMap<
    XMLHttpRequest,
    { url: ReturnType<Privacy['safeUrl']>; method: NetworkEvent['method'] }
  >();
  function report(event: NetworkEvent) {
    if (active) {
      try {
        emit(event);
      } catch {
        /* Instrumentation cannot change host request behavior. */
      }
    }
  }
  const wrappedFetch: typeof fetch = function (this: unknown, input, init) {
    // Never inspect headers, bodies, response content or arbitrary toString/getters.
    let requestMethod: unknown = 'GET';
    try {
      if (input instanceof Request) requestMethod = input.method;
      const descriptor = init && Object.getOwnPropertyDescriptor(init, 'method');
      if (descriptor && 'value' in descriptor) requestMethod = descriptor.value;
    } catch {
      requestMethod = 'OTHER';
    }
    const url = privacy.safeUrl(input),
      id = crypto.randomUUID(),
      start = performance.now(),
      startedAt = at();
    const promise = Reflect.apply(originalFetch, this, [input, init]);
    return promise.then(
      (response) => {
        report({
          kind: 'network',
          at: at(),
          requestId: id,
          transport: 'fetch',
          method: method(requestMethod),
          url,
          status: response.status,
          startedAt,
          durationMs: elapsed(start),
          outcome:
            response.status === 0 ? 'opaque' : response.status >= 400 ? 'http-error' : 'success',
        });
        return response;
      },
      (error) => {
        report({
          kind: 'network',
          at: at(),
          requestId: id,
          transport: 'fetch',
          method: method(requestMethod),
          url,
          status: null,
          startedAt,
          durationMs: elapsed(start),
          outcome:
            error instanceof DOMException && error.name === 'AbortError'
              ? 'aborted'
              : 'network-error',
        });
        throw error;
      },
    );
  };
  const wrappedOpen: typeof originalOpen = function (
    this: XMLHttpRequest,
    ...args: [
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null,
    ]
  ) {
    const result = Reflect.apply(originalOpen, this, args);
    requests.set(this, { method: method(args[0]), url: privacy.safeUrl(args[1]) });
    return result;
  };
  const wrappedSend: typeof originalSend = function (
    this: XMLHttpRequest,
    ...args: Parameters<typeof originalSend>
  ) {
    // Closures below must retain this request when invoked as DOM listeners.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const xhr = this;
    const info = requests.get(xhr) ?? { method: 'OTHER' as const, url: null };
    const id = crypto.randomUUID(),
      start = performance.now(),
      startedAt = at();
    let failure: NetworkEvent['outcome'] | null = null;
    const aborted = () => {
        failure = 'aborted';
      },
      failed = () => {
        failure = 'network-error';
      },
      timedOut = () => {
        failure = 'timeout';
      };
    const cleanup = () => {
      xhr.removeEventListener('loadend', done);
      xhr.removeEventListener('abort', aborted);
      xhr.removeEventListener('error', failed);
      xhr.removeEventListener('timeout', timedOut);
      removeListeners.delete(cleanup);
    };
    const done = () => {
      try {
        report({
          kind: 'network',
          at: at(),
          requestId: id,
          transport: 'xhr',
          method: info.method,
          url: info.url,
          status: xhr.status,
          startedAt,
          durationMs: elapsed(start),
          outcome:
            failure ??
            (xhr.status === 0 ? 'network-error' : xhr.status >= 400 ? 'http-error' : 'success'),
        });
      } finally {
        cleanup();
      }
    };
    xhr.addEventListener('abort', aborted);
    xhr.addEventListener('error', failed);
    xhr.addEventListener('timeout', timedOut);
    xhr.addEventListener('loadend', done);
    removeListeners.add(cleanup);
    try {
      return Reflect.apply(originalSend, xhr, args);
    } catch (error) {
      cleanup();
      throw error;
    }
  };
  window.fetch = wrappedFetch;
  prototype.open = wrappedOpen;
  prototype.send = wrappedSend;
  return () => {
    active = false;
    if (window.fetch === wrappedFetch) window.fetch = originalFetch;
    if (prototype.open === wrappedOpen) prototype.open = originalOpen;
    if (prototype.send === wrappedSend) prototype.send = originalSend;
    for (const remove of [...removeListeners]) remove();
  };
}
