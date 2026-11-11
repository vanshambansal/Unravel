import { PRESENTATION_PROPERTIES, presentationValueAllowed, sanitizePresentation } from '@unravel/contracts';

/** Snapshot values only. No selectors, custom properties, pseudo-content or resource loads. */
export function capturePresentation(element: Element | null): string | null {
  if (!element || !element.isConnected) return null;
  const view = element.ownerDocument.defaultView;
  if (!view) return null;
  const computed = view.getComputedStyle(element);
  const declarations: string[] = [];
  for (const property of PRESENTATION_PROPERTIES) {
    let value = computed.getPropertyValue(property).trim();
    if (property === 'font-family') value = /mono/i.test(value) ? 'monospace' : /(?:^|[,\s])serif(?:$|[,\s])/i.test(value) && !/sans/i.test(value) ? 'Georgia, serif' : 'system-ui, sans-serif';
    if (presentationValueAllowed(property, value)) declarations.push(`${property}:${value}`);
  }
  return sanitizePresentation(declarations.join(';'));
}
