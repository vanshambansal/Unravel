import {
  PRESENTATION_PROPERTIES,
  presentationValueAllowed,
  sanitizePresentation,
} from '@unravel/contracts';

/** Snapshot values only. No selectors, custom properties, pseudo-content or resource loads. */
export function capturePresentation(element: Element | null): string | null {
  if (!element || !element.isConnected) return null;
  const view = element.ownerDocument.defaultView;
  if (!view) return null;
  const computed = view.getComputedStyle(element);
  // Resolved pixel sizes freeze auto-growing containers at their initial height.
  // Typed OM retains auto/percentage sizing where the browser exposes it.
  const typed = (
    element as Element & {
      computedStyleMap?: () => { get(name: string): { toString(): string } | undefined };
    }
  ).computedStyleMap?.();
  const declarations: string[] = [];
  for (const property of PRESENTATION_PROPERTIES) {
    let value = computed.getPropertyValue(property).trim();
    if (property === 'width' || property === 'height') {
      const sizing = typed?.get(property)?.toString();
      if (sizing && (sizing === 'auto' || /^\d+(?:\.\d+)?%$/.test(sizing))) value = sizing;
    }
    if (property === 'font-family')
      value = /mono/i.test(value)
        ? 'monospace'
        : /(?:^|[,\s])serif(?:$|[,\s])/i.test(value) && !/sans/i.test(value)
          ? 'Georgia, serif'
          : 'system-ui, sans-serif';
    if (presentationValueAllowed(property, value)) declarations.push(`${property}:${value}`);
  }
  return sanitizePresentation(declarations.join(';'));
}
