import type { SemanticEvent, ErrorEvent as CapturedError } from '@unravel/contracts';
import type { Privacy } from './privacy';

export function instrumentEvents(privacy: Privacy, at: () => number, emit: (event: SemanticEvent) => void, multipleSelection?: (element: HTMLSelectElement) => void): () => void {
  let active = true;
  const cleanup: (() => void)[] = [];
  const send = (event: SemanticEvent) => { if (active) { try { emit(event); } catch { /* Never interrupt host event handlers. */ } } };
  function listen(target: EventTarget, name: string, handler: EventListener) { target.addEventListener(name, handler, true); cleanup.push(() => target.removeEventListener(name, handler, true)); }
  function action(event: Event) {
    const target = event.composedPath()[0];
    if (!(target instanceof Element) || privacy.interactionBlocked(target)) return;
    const submitter = event instanceof SubmitEvent ? event.submitter : null;
    const element = event.type === 'submit' && submitter instanceof Element ? submitter : event.type === 'click' ? target.closest('button,a,input,summary,[role="button"]') : target;
    if (!(element instanceof HTMLElement) || privacy.blocked(element)) return;
    const input = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement;
    let kind: 'click' | 'fill' | 'select' | 'check' | 'submit' = event.type === 'submit' ? 'submit' : 'click';
    let value: string | null = null, redacted = false;
    let values: string[] | null | undefined;
    if (event.type === 'input' || event.type === 'change') {
      if (!input) return;
      const checkbox = element instanceof HTMLInputElement && ['checkbox', 'radio'].includes(element.type);
      // 'input' covers text; 'change' covers selects/checks without duplicate actions.
      if (event.type === 'input' && (checkbox || element instanceof HTMLSelectElement)) return;
      if (event.type === 'change' && !checkbox && !(element instanceof HTMLSelectElement)) return;
      kind = checkbox ? 'check' : element instanceof HTMLSelectElement ? 'select' : 'fill';
      redacted = !privacy.valueAllowed(element);
      if (element instanceof HTMLSelectElement) {
        const selected = [...element.selectedOptions];
        redacted ||= selected.some(option => !privacy.valueAllowed(option));
        if (element.multiple) values = redacted ? null : selected.map(option => option.value.slice(0, 10000));
        else value = redacted ? null : element.value.slice(0, 10000);
      } else value = redacted ? null : checkbox ? String((element as HTMLInputElement).checked) : element.value.slice(0, 10000);
    }
    send({ kind: 'action', at: at(), action: kind, target: privacy.locator(element), value, redacted, ...(values !== undefined ? {values} : {}) });
    if (values !== undefined && element instanceof HTMLSelectElement) multipleSelection?.(element);
  }
  for (const name of ['click', 'input', 'change', 'submit']) listen(document, name, action);
  const errorTypes = ['Error', 'TypeError', 'RangeError', 'ReferenceError', 'SyntaxError', 'URIError', 'EvalError'];
  function errorType(value: unknown): CapturedError['errorType'] {
    if (!(value instanceof Error)) return 'Unknown';
    let name: string;
    try { name = value.name; } catch { return 'Unknown'; }
    return errorTypes.includes(name) ? name as CapturedError['errorType'] : 'Unknown';
  }
  listen(window, 'error', event => {
    if (!(event instanceof ErrorEvent)) return;
    const descriptor = event.error instanceof Error ? Object.getOwnPropertyDescriptor(event.error, 'message') : undefined;
    const message = privacy.errorMessage(event.message) ?? privacy.errorMessage(descriptor && 'value' in descriptor ? descriptor.value : undefined);
    send({ kind: 'error', at: at(), source: 'error', errorType: errorType(event.error), message, file: privacy.safeUrl(event.filename), line: event.lineno || null, column: event.colno || null });
  });
  listen(window, 'unhandledrejection', event => {
    const reason = (event as PromiseRejectionEvent).reason;
    const descriptor = reason instanceof Error ? Object.getOwnPropertyDescriptor(reason, 'message') : undefined;
    const message = typeof reason === 'string' ? reason : descriptor && 'value' in descriptor ? descriptor.value : undefined;
    send({ kind: 'error', at: at(), source: 'unhandledrejection', errorType: errorType(reason), message: privacy.errorMessage(message), file: null, line: null, column: null });
  });
  let lastAddress = location.href;
  function navigation(source: 'initial' | 'push' | 'replace' | 'pop' | 'hash') {
    if (source !== 'initial' && lastAddress === location.href) return;
    lastAddress = location.href;
    const url = privacy.safeUrl(location.href);
    if (url) send({ kind: 'navigation', at: at(), source, url });
  }
  const originalPush = history.pushState, originalReplace = history.replaceState;
  const push: typeof originalPush = function (this: History, ...args) { const result = Reflect.apply(originalPush, this, args); navigation('push'); return result; };
  const replace: typeof originalReplace = function (this: History, ...args) { const result = Reflect.apply(originalReplace, this, args); navigation('replace'); return result; };
  history.pushState = push; history.replaceState = replace;
  listen(window, 'popstate', () => navigation('pop')); listen(window, 'hashchange', () => navigation('hash')); navigation('initial');
  cleanup.push(() => { if (history.pushState === push) history.pushState = originalPush; if (history.replaceState === replace) history.replaceState = originalReplace; });
  return () => { active = false; for (const remove of cleanup.reverse()) remove(); };
}
