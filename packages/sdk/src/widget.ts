import { initialize } from './recorder';
import type { Recorder, RecorderOptions, RecordingMode } from './types';
import css from './widget.css';
import mark from './unravel-mark.svg';
import { widgetMotion } from './widget-motion';
import closeIcon from './icons/close.svg';
import checkIcon from './icons/check.svg';
import playIcon from './icons/play.svg';
import stopIcon from './icons/stop.svg';
import moveIcon from './icons/move.svg';
import resetIcon from './icons/reset.svg';
import { widgetPosition } from './widget-position';

export type WidgetOptions = Omit<RecorderOptions, 'submissionUrl'> & { applicationOrigin: string };
export interface ReportingWidget {
  open(): void;
  close(): void;
  destroy(): void;
}
type View =
  'ready' | 'starting' | 'recording' | 'describe' | 'submitting' | 'retry' | 'success' | 'discard';
const WIDGET = Symbol.for('unravel.reporting-widget');
const clock = (ms: number) =>
  `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;

/** Mount the complete visitor workflow. Initialization never starts capture or sends a report. */
export function mountWidget(options: WidgetOptions): ReportingWidget {
  if (typeof document === 'undefined' || !document.body)
    throw new Error(
      'Mount the reporting widget inside a browser lifecycle after the document is ready.',
    );
  const application = new URL(options.applicationOrigin);
  if (!/^https?:$/.test(application.protocol) || application.origin !== options.applicationOrigin)
    throw new Error(
      'Use an HTTP(S) Unravel origin without a path, credentials, query or fragment.',
    );
  const context = window as Window & { [WIDGET]?: object };
  if (context[WIDGET])
    throw new Error(
      'An Unravel reporting widget is already mounted. Destroy it before mounting another.',
    );
  let opened = false,
    disposed = false,
    view: View = 'ready',
    previous: View = 'ready';
  let title = '',
    description = '',
    error = '',
    recorder: Recorder,
    returnFocus: HTMLElement | null = null;
  let descriptionExpanded = false;
  let selectedMode: RecordingMode = 'masked-values';
  const host = document.createElement('div');
  host.setAttribute('data-unravel-block', '');
  host.setAttribute('data-unravel-widget', '');
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = css;
  const root = document.createElement('div'),
    live = document.createElement('p');
  live.className = 'status';
  live.setAttribute('role', 'status');
  live.setAttribute('aria-live', 'polite');
  const surface = document.createElement('div'),
    plate = document.createElement('div');
  surface.className = 'surface';
  plate.className = 'surface-material';
  plate.setAttribute('aria-hidden', 'true');
  root.className = 'surface-content';
  const moveHelp = document.createElement('p');
  moveHelp.id = 'unravel-move-help';
  moveHelp.className = 'sr-only';
  moveHelp.textContent =
    'Drag to move. When focused, use arrow keys to move, Shift for larger steps, or Home to reset position.';
  surface.append(plate, root);
  shadow.append(style, surface, live, moveHelp);
  const listeners = new AbortController();
  const motion = widgetMotion(surface, plate, root, listeners.signal);
  function update(next: View) {
    view = next;
    live.textContent =
      next === 'recording'
        ? 'Recording started. Reproduce the problem, then stop recording.'
        : next === 'describe'
          ? 'Recording stopped. Describe the issue before submitting.'
          : next === 'success'
            ? 'Your report was received.'
            : '';
    render();
  }
  function createRecorder() {
    return initialize({
      ...options,
      privacy: { ...options.privacy, mode: selectedMode },
      submissionUrl: `${application.origin}/api/ingest/${options.projectId}`,
      onStateChange(status) {
        options.onStateChange?.(status);
        if (disposed) return;
        if (status.state === 'starting') update('starting');
        if (status.state === 'recording') update('recording');
        if (status.state === 'stopped' && recorder) {
          error =
            status.reason !== 'manual'
              ? `Recording stopped: ${status.reason}. Review this partial recording before sending.`
              : '';
          const hasRecording = recorder.getRecording()?.hasFullSnapshot;
          if (hasRecording) opened = true;
          update(hasRecording ? 'describe' : 'ready');
        }
      },
      onSubmissionChange(status) {
        options.onSubmissionChange?.(status);
      },
    });
  }
  recorder = createRecorder();
  const owner = {};
  context[WIDGET] = owner;
  document.body.append(host);
  const position = widgetPosition({
    host,
    shadow,
    projectId: options.projectId,
    signal: listeners.signal,
    cancelMotion: motion.finish,
    announce: (message) => {
      live.textContent = message;
    },
  });
  function element<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    text?: string,
    className?: string,
  ) {
    const n = document.createElement(tag);
    if (text) n.textContent = text;
    if (className) n.className = className;
    return n;
  }
  function action(text: string, name: string, className = 'primary') {
    const n = element('button', text, className);
    n.type = 'button';
    n.dataset.action = name;
    const source =
      name === 'close'
        ? closeIcon
        : name === 'move'
          ? moveIcon
          : name === 'reset-position'
            ? resetIcon
            : name === 'start'
              ? playIcon
              : name === 'stop' && text !== 'Cancel'
                ? stopIcon
                : null;
    if (source) n.prepend(drawnIcon(source));
    return n;
  }
  function drawnIcon(source: string) {
    const icon = element('span', undefined, 'widget-icon');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = source;
    return icon;
  }
  function focusFirst() {
    (
      root.querySelector<HTMLElement>('input[name="title"]') ??
      root.querySelector<HTMLElement>('[data-action="start"]') ??
      root.querySelector<HTMLElement>('[data-action="stop"]') ??
      root.querySelector<HTMLElement>('button')
    )?.focus({ preventScroll: true });
  }
  function render() {
    if (disposed) return;
    const before = motion.capture();
    const focused = shadow.activeElement as HTMLElement | null;
    const focusAction = focused?.dataset.action,
      hadFocus = !!focused;
    root.replaceChildren();
    root.dataset.state = view;
    surface.dataset.state = view;
    if (!opened) {
      if (view === 'recording' || view === 'starting') {
        const dock = element('div', undefined, 'dock');
        const b = action(
          `${view === 'starting' ? 'Preparing...' : clock(recorder.getStatus().durationMs)}`,
          'open',
        );
        b.setAttribute('aria-label', 'Open recording controls');
        b.dataset.timer = '';
        dock.dataset.widgetDrag = '';
        b.dataset.widgetDrag = '';
        b.setAttribute('aria-describedby', moveHelp.id);
        b.title = 'Drag to move, or open recording controls';
        dock.append(
          element('span', undefined, 'dot'),
          b,
          action(view === 'starting' ? 'Cancel' : 'Stop recording', 'stop', 'stop'),
        );
        root.append(dock);
      } else {
        const b = action(
          view === 'success'
            ? 'Report received'
            : view === 'retry'
              ? 'Retry bug report'
              : 'Report a bug',
          'open',
          'launcher',
        );
        const icon = element('span');
        icon.innerHTML = mark;
        b.prepend(icon);
        b.dataset.widgetDrag = '';
        b.setAttribute('aria-describedby', moveHelp.id);
        b.title = 'Report a bug. Drag to move; Home resets position.';
        root.append(b);
      }
      position.reconcile();
      motion.settle(before);
      return;
    }
    const panel = element('section', undefined, `panel ${view}`);
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-label', 'Report a bug');
    const header = element('header', undefined, 'header');
    const icon = element('span');
    icon.innerHTML = mark;
    header.dataset.widgetDrag = '';
    const move = action('', 'move', 'move-control');
    move.dataset.widgetDrag = '';
    move.setAttribute('aria-label', 'Move bug reporter');
    move.setAttribute('aria-describedby', moveHelp.id);
    move.title = 'Drag or use arrow keys to move';
    const reset = action('', 'reset-position', 'reset-position');
    reset.setAttribute('aria-label', 'Reset reporter position');
    reset.title = 'Reset position';
    const close = action('', 'close', 'close');
    close.setAttribute('aria-label', 'Minimize bug reporter');
    header.append(icon, element('span', 'unravel', 'brand'), move, reset, close);
    panel.append(header);
    const heading = (s: string) => panel.append(element('h2', s));
    const copy = (s: string, cls?: string) => panel.append(element('p', s, cls));
    if (view === 'ready') {
      heading('Show us what went wrong.');
      const modes = element('fieldset', undefined, 'recording-modes');
      modes.append(element('legend', 'Recording privacy'));
      for (const [value, name, description] of [
        [
          'masked-values',
          'Mask entered values',
          'Page text stays visible. Values inside fields are masked.',
        ],
        [
          'full',
          'Full-content recording',
          'Include entered and sensitive values in the report you submit.',
        ],
      ]) {
        const label = element('label', undefined, 'recording-choice'),
          input = element('input'),
          text = element('span');
        input.type = 'radio';
        input.name = 'recording-mode';
        input.value = value;
        input.checked = selectedMode === value;
        const title = element('strong', name),
          detail = element('small', description);
        text.append(title, detail);
        label.append(input, text);
        modes.append(label);
      }
      panel.append(modes, action('Start recording', 'start'));
      copy(
        'You control the recording. Nothing is sent until you submit. Both modes include error messages and URL paths. Network bodies, headers and cookies are excluded.',
        'small',
      );
    } else if (view === 'starting') {
      heading('Getting ready...');
      copy('Recording has not started yet. Keep this page open for a moment.');
      panel.append(action('Cancel', 'stop', 'secondary'));
    } else if (view === 'recording') {
      const badge = element('div', undefined, 'badge');
      badge.append(element('span', undefined, 'dot'), element('span', 'RECORDING'));
      panel.append(badge);
      const timer = element('div', undefined, 'timer');
      const time = element('span', clock(recorder.getStatus().durationMs), 'time');
      time.dataset.timer = '';
      timer.append(time, element('p', 'Your steps are being captured'));
      panel.append(timer);
      copy('Repeat the problem on this page. Stop when you have shown what happened.');
      panel.append(action('Stop recording', 'stop'));
      copy(
        selectedMode === 'full'
          ? 'Full-content recording: entered and sensitive values are included.'
          : 'Mask entered values: page text is visible; field values are masked.',
        'small',
      );
    } else if (view === 'describe') {
      heading('Tell us what happened.');
      copy(
        selectedMode === 'full'
          ? 'Full-content recording: this report includes entered and sensitive values.'
          : 'Entered values were masked. Visible page text is included.',
        'small',
      );
      const summary = element('div', undefined, 'summary');
      const captured = element('span', 'Recording captured');
      captured.prepend(drawnIcon(checkIcon));
      summary.append(
        captured,
        element('span', `${Math.round(recorder.getStatus().durationMs / 1000)} sec`),
      );
      panel.append(summary);
      const form = element('form', undefined, 'form');
      const details = element('details', undefined, 'optional-details');
      details.open = descriptionExpanded || !!description;
      details.append(element('summary', 'Add details (optional)'));
      for (const [name, label, value] of [
        ['title', 'Report title', title],
        ['description', 'What happened / expected? - optional', description],
      ]) {
        const field = element('div', undefined, 'field'),
          l = element('label', label),
          input = name === 'title' ? element('input') : element('textarea');
        input.id = `unravel-${name}`;
        input.name = name;
        input.value = value;
        input.maxLength = name === 'title' ? 120 : 2000;
        l.htmlFor = input.id;
        if (input instanceof HTMLInputElement) {
          input.required = true;
          input.placeholder = 'e.g. Save changes does nothing';
        } else input.placeholder = 'What did you do, and what did you expect?';
        field.append(l, input);
        if (name === 'description') details.append(field);
        else form.append(field);
      }
      details.append(element('p', 'Please leave out passwords and other secrets.', 'small'));
      form.append(details);
      const send = action('Send bug report', 'submit');
      send.type = 'submit';
      form.append(send);
      panel.append(form);
      const foot = element('div', undefined, 'foot');
      foot.append(
        action('Discard recording', 'discard', 'link'),
        element('p', 'Nothing sent yet', 'small'),
      );
      panel.append(foot);
    } else if (view === 'submitting') {
      heading('Sending your report...');
      copy('Your recording and description are on their way. Please keep this page open.');
    } else if (view === 'retry') {
      heading('Report not confirmed yet.');
      copy(
        'Your recording is still available in this tab. Retry sends the same report without creating a duplicate.',
      );
      panel.append(
        action('Retry submission', 'submit'),
        action('Discard recording', 'discard', 'link'),
      );
      copy('Report details stay unchanged during retry.', 'small');
    } else if (view === 'success') {
      heading('Thanks for helping us fix it.');
      copy('The developer can now investigate your recording and report.');
      panel.append(action('Done', 'done'));
    } else {
      heading('Discard this local recording?');
      copy(
        'This clears the recording and description from this tab. If an earlier submission reached the server, its saved report will remain.',
      );
      panel.append(
        action('Keep this report', 'keep'),
        action('Discard unsent report', 'confirm-discard', 'secondary'),
      );
      copy('Previously submitted reports are unaffected.', 'small');
    }
    if (error) {
      const e = element('p', error, view === 'retry' ? 'error' : 'notice');
      e.setAttribute('role', 'alert');
      panel.append(e);
    }
    root.append(panel);
    position.reconcile();
    motion.settle(before);
    if (hadFocus) {
      const next = Array.from(root.querySelectorAll<HTMLElement>('[data-action]')).find(
        (n) => n.dataset.action === focusAction,
      );
      (next ?? root.querySelector<HTMLElement>('h2') ?? panel).tabIndex = 0;
      (next ?? root.querySelector<HTMLElement>('h2') ?? panel).focus({ preventScroll: true });
    }
  }
  async function submit() {
    if (view !== 'describe' && view !== 'retry') return;
    error = '';
    update('submitting');
    try {
      await recorder.submit({ title, description });
      if (!disposed) update('success');
    } catch (e) {
      if (!disposed) {
        error = e instanceof Error ? e.message : 'Could not confirm submission.';
        update('retry');
      }
    }
  }
  function open() {
    if (disposed) return;
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    opened = true;
    render();
    focusFirst();
  }
  function close() {
    if (disposed) return;
    opened = false;
    render();
    (root.querySelector('button') ?? returnFocus)?.focus({ preventScroll: true });
  }
  shadow.addEventListener(
    'change',
    (event) => {
      const input = event.target;
      if (
        view === 'ready' &&
        input instanceof HTMLInputElement &&
        input.name === 'recording-mode' &&
        (input.value === 'full' || input.value === 'masked-values')
      )
        selectedMode = input.value;
    },
    { signal: listeners.signal },
  );
  shadow.addEventListener(
    'input',
    (event) => {
      const t = event.target;
      if (t instanceof HTMLInputElement && t.name === 'title') title = t.value;
      if (t instanceof HTMLTextAreaElement && t.name === 'description') description = t.value;
    },
    { signal: listeners.signal },
  );
  shadow.addEventListener(
    'toggle',
    (event) => {
      if (
        event.target instanceof HTMLDetailsElement &&
        event.target.classList.contains('optional-details')
      ) {
        descriptionExpanded = event.target.open;
        position.reconcile();
      }
    },
    { signal: listeners.signal, capture: true },
  );
  shadow.addEventListener(
    'submit',
    (event) => {
      event.preventDefault();
      void submit();
    },
    { signal: listeners.signal },
  );
  shadow.addEventListener(
    'click',
    (event) => {
      const target =
        event.target instanceof Element ? event.target.closest<HTMLElement>('[data-action]') : null;
      if (!target) return;
      switch (target.dataset.action) {
        case 'open':
          open();
          break;
        case 'close':
          close();
          break;
        case 'reset-position':
          position.reset();
          break;
        case 'move':
          live.textContent = moveHelp.textContent;
          break;
        case 'start':
          error = '';
          recorder.destroy();
          recorder = createRecorder();
          void recorder.start().catch(() => {
            if (!disposed) {
              error = 'Recording could not start. Please try again.';
              update('ready');
            }
          });
          break;
        case 'stop':
          recorder.stop();
          if (view === 'starting') update('ready');
          break;
        case 'submit':
          if (view === 'retry') void submit();
          break;
        case 'discard':
          previous = view;
          update('discard');
          break;
        case 'keep':
          update(previous);
          break;
        case 'confirm-discard':
        case 'done': {
          const done = target.dataset.action === 'done';
          recorder.destroy();
          selectedMode = 'masked-values';
          recorder = createRecorder();
          title = '';
          description = '';
          descriptionExpanded = false;
          error = '';
          view = 'ready';
          if (done) close();
          else render();
          break;
        }
      }
    },
    { signal: listeners.signal },
  );
  shadow.addEventListener(
    'keydown',
    (event) => {
      if ((event as KeyboardEvent).key === 'Escape') {
        event.preventDefault();
        close();
      }
    },
    { signal: listeners.signal },
  );
  const timer = window.setInterval(() => {
    if (disposed || view !== 'recording') return;
    for (const n of root.querySelectorAll<HTMLElement>('[data-timer]'))
      n.textContent = opened
        ? clock(recorder.getStatus().durationMs)
        : clock(recorder.getStatus().durationMs);
  }, 250);
  const api: ReportingWidget = {
    open,
    close,
    destroy() {
      if (disposed) return;
      disposed = true;
      clearInterval(timer);
      listeners.abort();
      recorder.destroy();
      host.remove();
      if (context[WIDGET] === owner) delete context[WIDGET];
    },
  };
  render();
  return api;
}
