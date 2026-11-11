import type { Locator, SafeUrl } from '@unravel/contracts';
import type { PrivacyOptions } from './types';
import { capturePresentation } from './presentation';
export const REDACTED = '[redacted]';
export const BLOCK_SELECTOR = 'script,iframe,canvas,video,audio,svg,object,embed,[data-unravel-block],input[type="password"],input[type="hidden"],[autocomplete="current-password"],[autocomplete="new-password"],[autocomplete="one-time-code"],[autocomplete^="cc-"]';
const standardTags = new Set('html head body title meta link main header footer section article aside nav div span p h1 h2 h3 h4 h5 h6 form label input textarea select option button a ul ol li dl dt dd table thead tbody tr th td details summary br hr pre code strong em small fieldset legend img style'.split(' '));

export function createPrivacy(options: PrivacyOptions = {}) {
  const textSelectors = [...(options.allowTextSelectors ?? [])], valueSelectors = [...(options.allowValueSelectors ?? [])];
  for (const selector of [...textSelectors, ...valueSelectors]) {
    if (typeof selector !== 'string' || selector.length > 500) throw new Error('Invalid privacy selector.');
    try { document.querySelector(selector); } catch { throw new Error('Invalid privacy selector.'); }
  }
  const ids = new Set(options.testIds ?? []), paths = new Set(options.paths ?? []), stylesheets = new Set(options.stylesheetPaths ?? []), errors = new Set(options.errorMessages ?? []);
  const everSensitive = new WeakSet<Element>();
  for (const element of document.querySelectorAll(BLOCK_SELECTOR)) everSensitive.add(element);
  for (const path of [...paths, ...stylesheets]) if (!path.startsWith('/') || path.includes('?') || path.includes('#') || path.includes('\\') || /\s/.test(path)) throw new Error('Allowlisted paths must be exact paths without query strings or fragments.');
  const blocked = (element: Element | null) => {
    let node = element;
    while (node) {
      // Shadow-root replay is unsupported. Omit the host/subtree instead of emitting
      // an unsupported snapshot that makes an otherwise ordinary page unsubmitable.
      if (node.shadowRoot || node.getRootNode() instanceof ShadowRoot) return true;
      if (everSensitive.has(node)) return true;
      if (node.matches(BLOCK_SELECTOR)) { everSensitive.add(node); return true; }
      // Widget UI lives in a shadow root. Its blocked host must win over all opt-ins.
      const root = node.getRootNode();
      node = node.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
    }
    return false;
  };
  const elementFor = (node: Node | null) => node?.nodeType === 1 ? node as Element : node?.parentElement ?? null;
  const matches = (element: Element | null, selectors: string[]) => !blocked(element) && selectors.some(selector => Boolean(element?.closest(selector)));
  const valueAllowed = (element: Element | null) => matches(element, valueSelectors) && Boolean(element?.matches('input:not([type="password"]):not([type="hidden"]),textarea,select,option'));
  function safeUrl(input: unknown): SafeUrl | null {
    try {
      let address: string;
      if (typeof input === 'string') address = input;
      else if (input instanceof URL) address = input.href;
      else if (input instanceof Request) address = input.url;
      else return null;
      const url = new URL(address, location.href);
      if (!['http:', 'https:'].includes(url.protocol)) return null;
      return { origin: url.origin, path: url.origin === location.origin && (url.pathname === '/' || paths.has(url.pathname)) ? url.pathname : null };
    } catch { return null; }
  }
  function locator(element: Element): Locator {
    const id = element.getAttribute('data-testid');
    if (id && ids.has(id)) return { kind: 'testId', value: id.slice(0, 120) };
    const parts: string[] = []; let node: Element | null = element;
    while (node && node !== document.body && parts.length < 20 && node.parentElement && standardTags.has(node.localName)) {
      const siblings = [...node.parentElement.children].filter(sibling => sibling.localName === node!.localName);
      const ordinal = siblings.indexOf(node) + 1;
      if (ordinal > 9999) return { kind: 'unresolved', tag: element.localName };
      parts.unshift(`${node.localName}:nth-of-type(${ordinal})`); node = node.parentElement;
    }
    const value = `body > ${parts.join(' > ')}`;
    if (node === document.body && parts.length && value.length <= 500) return { kind: 'css', value };
    return { kind: 'unresolved', tag: standardTags.has(element.localName) ? element.localName : 'element' };
  }
  return {
    blocked, elementFor, valueAllowed, safeUrl, locator,
    text(node: Node | null, value: unknown): string {
      const element = elementFor(node);
      if (element?.closest('script,style')) return '';
      // Whitespace contains no page content; retaining it avoids a redaction label for every indentation node.
      if (typeof value === 'string' && /^[\t\r\n ]*$/.test(value)) return value.slice(0, 10000);
      return matches(element, textSelectors) && typeof value === 'string' ? value.slice(0, 10000) : REDACTED;
    },
    value(element: Element | null, value: unknown) { return valueAllowed(element) && typeof value === 'string' ? value.slice(0, 10000) : REDACTED; },
    errorMessage(message: unknown) { return typeof message === 'string' && errors.has(message) ? message.slice(0, 1000) : null; },
    attributes(element: Element | null, raw: Record<string, unknown>): Record<string, string | number | boolean | null> {
      const clean: Record<string, string | number | boolean | null> = {};
      for (const [name, value] of Object.entries(raw)) {
        if (name === 'data-testid' && typeof value === 'string' && ids.has(value)) clean[name] = value;
        else if (name === 'type' && typeof value === 'string' && /^(text|password|hidden|email|number|checkbox|radio|button|submit|reset|search|tel|url|date|time|range|color)$/.test(value)) clean[name] = value;
        else if (['checked', 'selected'].includes(name)) { if (valueAllowed(element)) clean[name] = value === true || value === '' ? true : null; }
        else if (['disabled', 'multiple', 'required'].includes(name)) clean[name] = value === true || value === '' ? true : null;
        else if (['width', 'height', 'rows', 'cols', 'size', 'colspan', 'rowspan'].includes(name) && /^\d{1,5}$/.test(String(value))) clean[name] = String(value);
        else if (['rr_width', 'rr_height'].includes(name) && typeof value === 'string' && /^\d+(\.\d+)?px$/.test(value)) clean[name] = value;
        else if (name === 'value') clean[name] = valueAllowed(element) && typeof value === 'string' ? value.slice(0, 10000) : '';
        else if (name === 'rel' && value === 'stylesheet') clean[name] = 'stylesheet';
        else if (name === 'href' && element?.localName === 'link' && typeof value === 'string') {
          try { const url = new URL(value, location.href); if (url.origin === location.origin && stylesheets.has(url.pathname)) clean[name] = url.origin + url.pathname; } catch { /* Resource omitted. */ }
        }
      }
      if (!blocked(element) && element && !element.matches('head,link,style,meta,title')) {
        const style = capturePresentation(element);
        if (style) clean.style = style;
      }
      return clean;
    },
    tag(value: unknown) { return typeof value === 'string' && standardTags.has(value) ? value : 'div'; },
  };
}
export type Privacy = ReturnType<typeof createPrivacy>;
