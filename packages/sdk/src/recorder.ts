import { RecordingSchema, SemanticEventSchema, RECORDING_VERSION, type Recording, type ReplayEvent, type SemanticEvent, type StopReason } from '@unravel/contracts';
import { createPrivacy } from './privacy';
import { createReplaySanitizer } from './replay';
import { instrumentNetwork } from './network';
import { instrumentEvents } from './events';
import { createSubmission } from './submission';
export type { SubmissionState } from './submission';
import type { Recorder, RecorderOptions, RecorderState, RecorderStatus } from './types';
export type { Recorder, RecorderOptions, RecorderStatus, RecorderState, PrivacyOptions } from './types';
export type { Recording } from '@unravel/contracts';

const ACTIVE_RECORDER = Symbol.for('unravel.active-recorder');
export function initialize(options: RecorderOptions): Recorder {
  if (typeof window === 'undefined' || typeof document === 'undefined') throw new Error('Initialize the browser SDK inside a client lifecycle. Importing it on the server is safe.');
  if (!/^https?:$/.test(location.protocol) || typeof crypto.randomUUID !== 'function') throw new Error('Recording requires HTTPS or a loopback development origin.');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(options.projectId)) throw new Error('A valid public project identifier is required.');
  const privacy = createPrivacy(options.privacy);
  const projectId = options.projectId, onStateChange = options.onStateChange;
  const submission = createSubmission(options.submissionUrl, options.onSubmissionChange);
  function limit(value: number | undefined, fallback: number, min: number, max: number) {
    if (value === undefined) return fallback;
    if (!Number.isInteger(value) || value < min || value > max) throw new Error('Recording limits are outside the supported range.');
    return value;
  }
  const maxDurationMs = limit(options.limits?.maxDurationMs, 120000, 100, 600000);
  const maxBytes = limit(options.limits?.maxBytes, 5000000, 1024, 20000000);
  const maxEvents = limit(options.limits?.maxEvents, 5000, 1, 20000);
  const owner = {}, context = window as Window & { [ACTIVE_RECORDER]?: object };
  let state: RecorderState = 'idle', reason: StopReason | null = null, result: Recording | null = null;
  let generation = 0, pending: Promise<void> | null = null;
  const cleanups: (() => void)[] = [];
  let started = 0, count = 0, bytes = 0, filtered = 0;
  const encoder = new TextEncoder();
  const at = () => Math.max(0, Math.round(performance.now() - started));
  const status = (): RecorderStatus => ({ state, reason, eventCount: count, bytes, durationMs: state === 'recording' ? at() : result?.durationMs ?? 0, filteredReplayEvents: filtered });
  function notify() { try { onStateChange?.(status()); } catch { /* Consumer UI callbacks cannot break instrumentation. */ } }
  function release() { if (context[ACTIVE_RECORDER] === owner) delete context[ACTIVE_RECORDER]; }
  function own(cleanup: () => void) { if (state === 'recording') cleanups.push(cleanup); else cleanup(); }
  function finish(stopReason: StopReason) {
    if (state !== 'recording' && state !== 'starting') return;
    generation++; pending = null; reason = stopReason; state = 'stopped';
    for (const cleanup of cleanups.splice(0).reverse()) { try { cleanup(); } catch { /* Continue disposing all owned resources. */ } }
    release();
    if (result) {
      result.durationMs = at(); result.stopReason = stopReason;
      result.truncated = !['manual', 'navigation'].includes(stopReason);
      result.filteredReplayEvents = filtered;
      bytes = encoder.encode(JSON.stringify(result)).byteLength;
    }
    notify();
  }
  function append(event: ReplayEvent | SemanticEvent, replay: boolean) {
    if (state !== 'recording' || !result) return;
    const cost = encoder.encode(JSON.stringify(event)).byteLength + 1;
    if (bytes + cost > maxBytes) { finish('size-limit'); return; }
    if (count >= maxEvents) { finish('event-limit'); return; }
    if (replay) { result.replay.push(event as ReplayEvent); if ((event as ReplayEvent).type === 2) result.hasFullSnapshot = true; }
    else result.events.push(event as SemanticEvent);
    bytes += cost; count++;
    if (count >= maxEvents) finish('event-limit');
  }
  function semantic(event: SemanticEvent) {
    const parsed = SemanticEventSchema.safeParse(event);
    if (parsed.success) append(parsed.data, false); else finish('recorder-error');
  }
  const recorder: Recorder = {
    start() {
      if (state === 'destroyed') return Promise.reject(new Error('This recorder has been destroyed.'));
      if (submission.status().state === 'submitting') return Promise.reject(new Error('Wait for report submission before starting another recording.'));
      if (state === 'recording') return Promise.resolve();
      if (pending) return pending;
      if (context[ACTIVE_RECORDER]) return Promise.reject(new Error('Another Unravel recording is active on this page.'));
      const ticket = ++generation; context[ACTIVE_RECORDER] = owner;
      submission.reset();
      state = 'starting'; reason = null; result = null; count = 0; bytes = 0; filtered = 0; notify();
      pending = (async () => {
        try {
          const { record } = await import('@rrweb/record');
          if (ticket !== generation) return;
          started = performance.now();
          result = { version: RECORDING_VERSION, presentation: 1, ...(privacy.mode ? {captureMode: privacy.mode} : {}), id: crypto.randomUUID(), projectId, startedAt: Date.now(), durationMs: 0, initialUrl: privacy.safeUrl(location.href)!, stopReason: 'manual', truncated: false, hasFullSnapshot: false, filteredReplayEvents: 0, replay: [], events: [] };
          // Reserve envelope/duration/reason growth so the final JSON stays under cap.
          bytes = encoder.encode(JSON.stringify(result)).byteLength + 512;
          state = 'recording';
          own(instrumentEvents(privacy, at, semantic, element => {
            // rrweb's scalar input state cannot represent a multiple selection.
            // Record safe option attributes explicitly, including deselection.
            const allowed = privacy.valueAllowed(element) && [...element.selectedOptions].every(option => privacy.valueAllowed(option));
            const attributes = [...element.options].flatMap(option => {
              const id = record.mirror.getId(option);
              return id < 0 ? [] : [{id, attributes: {selected: allowed && option.selected ? true : null}}];
            });
            append({type:3,timestamp:Date.now(),data:{source:0,attributes,texts:[],adds:[],removes:[]}}, true);
          }));
          if (state !== 'recording') return;
          own(instrumentNetwork(privacy, at, semantic));
          const sanitize = createReplaySanitizer(privacy, id => record.mirror.getNode(id));
          const stop = record({
            emit(event) {
              if (state !== 'recording') return;
              try { const safe = sanitize(event); if (safe) append(safe, true); else filtered++; }
              catch { finish('recorder-error'); }
            },
            blockSelector: privacy.blockSelector, ignoreSelector: '[data-unravel-block]', maskAllInputs: true, maskTextSelector: '*',
            maskTextFn: (text, element) => privacy.text(element, text), maskInputFn: (text, element) => privacy.value(element, text),
            inlineStylesheet: false, inlineImages: false, collectFonts: false, recordCanvas: false, recordCrossOriginIframes: false,
            slimDOMOptions: { script: true, comment: true, headFavicon: true, headMetaDescKeywords: true, headMetaSocial: true, headMetaRobots: true, headMetaHttpEquiv: true, headMetaAuthorship: true, headMetaVerification: true },
            sampling: { mousemove: 200, scroll: 150, input: 'all' },
          });
          if (!stop) throw new Error('Recorder unavailable.');
          own(() => { stop(); record.mirror.reset(); });
          if (state !== 'recording') return;
          const timer = window.setTimeout(() => finish('duration-limit'), maxDurationMs); own(() => clearTimeout(timer));
          const pagehide = () => finish('navigation'); window.addEventListener('pagehide', pagehide); own(() => window.removeEventListener('pagehide', pagehide));
          notify();
        } catch {
          if (ticket === generation) { finish('recorder-error'); throw new Error('The recorder could not start. No recording is active.'); }
        } finally { if (ticket === generation) pending = null; }
      })();
      return pending;
    },
    stop() { finish('manual'); return recorder.getRecording(); },
    getRecording() {
      if (state !== 'stopped' || !result) return null;
      return structuredClone(RecordingSchema.parse(result));
    },
    getStatus: status,
    getSubmissionStatus: submission.status,
    submit(details) {
      const recording = recorder.getRecording();
      if (!recording) return Promise.reject(new Error('Stop a recording before submitting it.'));
      return submission.submit(recording, details);
    },
    destroy() {
      if (state === 'destroyed') return;
      finish('manual'); submission.reset(); generation++; pending = null; release(); result = null; count = 0; bytes = 0; filtered = 0; reason = null; state = 'destroyed'; notify();
    },
  };
  return recorder;
}
