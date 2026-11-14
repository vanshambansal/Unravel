import * as z from 'zod/mini';

export const RECORDING_VERSION = 1 as const;
export const PRESENTATION_VERSION = 1 as const;
// A bounded presentation vocabulary, never arbitrary stylesheet text or resource URLs.
const lengths = /^(?:auto|none|normal|min-content|max-content|(?:-?\d{1,5}(?:\.\d{1,4})?(?:px|%|vh|vw)|0)(?: (?:-?\d{1,5}(?:\.\d{1,4})?(?:px|%)|0)){0,15})$/;
const color = /^(?:transparent|currentcolor|#[0-9a-f]{3,8}|rgba?\([0-9.,% /-]+\)|hsla?\([0-9.,% /-]+\)|okl(?:ab|ch)\([0-9.,% /-]+\))$/i;
const enums: Record<string, readonly string[]> = {
  display: ['none','block','inline','inline-block','flex','inline-flex','grid','inline-grid','contents','table','table-row','table-cell','table-row-group','table-header-group','table-footer-group','list-item'],
  position: ['static','relative','absolute','fixed','sticky'], 'box-sizing': ['border-box','content-box'],
  'flex-direction': ['row','row-reverse','column','column-reverse'], 'flex-wrap': ['nowrap','wrap','wrap-reverse'],
  'font-family': ['system-ui, sans-serif','Arial, sans-serif','Georgia, serif','monospace'], 'font-style': ['normal','italic','oblique'],
  'text-align': ['start','end','left','right','center','justify'], 'text-transform': ['none','uppercase','lowercase','capitalize'],
  'white-space': ['normal','nowrap','pre','pre-wrap','pre-line','break-spaces'], 'word-break': ['normal','break-all','keep-all','break-word'], 'overflow-wrap': ['normal','anywhere','break-word'],
  visibility: ['visible','hidden','collapse'], 'text-overflow': ['clip','ellipsis'], 'list-style-type': ['none','disc','circle','square','decimal'],
};
const lengthProperties = ['width','height','min-width','min-height','max-width','max-height','top','right','bottom','left','margin-top','margin-right','margin-bottom','margin-left','padding-top','padding-right','padding-bottom','padding-left','row-gap','column-gap','font-size','line-height','letter-spacing','flex-basis','grid-template-columns','grid-template-rows', ...['top','right','bottom','left'].map(side => `border-${side}-width`), ...['top-left','top-right','bottom-left','bottom-right'].map(corner => `border-${corner}-radius`)];
export const PRESENTATION_PROPERTIES = [...Object.keys(enums), ...lengthProperties, 'color','background-color', ...['top','right','bottom','left'].flatMap(side => [`border-${side}-color`,`border-${side}-style`]), 'align-items','align-self','justify-content','justify-items','overflow-x','overflow-y','font-weight','flex-grow','flex-shrink','opacity','z-index'] as const;
export function presentationValueAllowed(property: string, value: string): boolean {
  if (!value || value.length > 240 || /[;{}<>"'\\\n\r]/.test(value)) return false;
  if (enums[property]) return enums[property].includes(value);
  if (lengthProperties.includes(property)) return lengths.test(value);
  if (['color','background-color','border-top-color','border-right-color','border-bottom-color','border-left-color'].includes(property)) return color.test(value);
  if (/^border-(top|right|bottom|left)-style$/.test(property)) return ['none','hidden','solid','dashed','dotted','double','groove','ridge','inset','outset'].includes(value);
  if (['align-items','align-self','justify-content','justify-items'].includes(property)) return ['auto','normal','stretch','start','end','center','flex-start','flex-end','baseline','space-between','space-around','space-evenly'].includes(value);
  if (['overflow-x','overflow-y'].includes(property)) return ['visible','hidden','clip','scroll','auto'].includes(value);
  if (property === 'font-weight') return /^(?:normal|bold|[1-9]\d{0,2}|1000)$/.test(value);
  if (['flex-grow','flex-shrink'].includes(property)) return /^\d{1,3}(?:\.\d{1,4})?$/.test(value);
  if (property === 'opacity') return /^(?:0(?:\.\d{1,5})?|1(?:\.0{1,5})?)$/.test(value);
  return property === 'z-index' && /^(?:auto|-?\d{1,4})$/.test(value);
}
export function sanitizePresentation(input: unknown): string | null {
  if (typeof input !== 'string' || input.length > 8192) return null;
  const result = new Map<string, string>();
  for (const declaration of input.split(';')) {
    if (!declaration.trim()) continue;
    const colon = declaration.indexOf(':');
    if (colon < 1) return null;
    const property = declaration.slice(0, colon).trim(), value = declaration.slice(colon + 1).trim();
    if (!presentationValueAllowed(property, value)) return null;
    result.set(property, value);
  }
  return [...result].sort(([a], [b]) => a.localeCompare(b)).map(([p, v]) => `${p}:${v}`).join(';');
}
const text = (max: number) => z.string().check(z.maxLength(max));
const positive = z.number().check(z.gte(0));
const nullableText = (max: number) => z.nullable(text(max));
export const SafeUrlSchema = z.strictObject({
  origin: text(512).check(z.refine(value => { try { const url = new URL(value); return /^https?:$/.test(url.protocol) && url.origin === value; } catch { return false; } }, 'Expected an HTTP(S) origin')),
  path: z.nullable(text(2048).check(z.refine(value => value.startsWith('/') && !/[?#\\\s]/.test(value), 'Expected a path without query or fragment'))),
});
export type SafeUrl = z.infer<typeof SafeUrlSchema>;

// Structural locators contain tag names/ordinals only, never page text or IDs.
export const STRUCTURAL_LOCATOR = /^body(?: > [a-z][a-z0-9]{0,15}:nth-of-type\([1-9][0-9]{0,3}\)){1,20}$/;
export const LocatorSchema = z.union([
  z.strictObject({ kind: z.literal('testId'), value: text(120) }),
  z.strictObject({ kind: z.literal('css'), value: text(500).check(z.regex(STRUCTURAL_LOCATOR)) }),
  z.strictObject({ kind: z.literal('unresolved'), tag: text(32) }),
]);
const time = { at: positive };
export const ActionSchema = z.strictObject({
  kind: z.literal('action'), ...time,
  action: z.enum(['click', 'fill', 'select', 'check', 'submit']),
  target: LocatorSchema, targetLabel: z.optional(text(160)), value: nullableText(10000), redacted: z.boolean(),
  // Presence means a native multiple selection; null means masked, [] means deselect all.
  values: z.optional(z.nullable(z.array(text(10000)).check(z.maxLength(100)))),
}).check(z.refine(event => event.values === undefined || event.action === 'select' && event.value === null && (event.redacted ? event.values === null : event.values !== null), 'Invalid multiple selection.'));
export const NetworkSchema = z.strictObject({
  kind: z.literal('network'), ...time, requestId: z.uuid(),
  transport: z.enum(['fetch', 'xhr']), method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'OTHER']),
  url: z.nullable(SafeUrlSchema), status: z.nullable(z.number().check(z.int(), z.gte(0), z.lte(599))),
  startedAt: positive, durationMs: positive,
  outcome: z.enum(['success', 'http-error', 'network-error', 'aborted', 'timeout', 'opaque']),
});
export const ErrorSchema = z.strictObject({
  kind: z.literal('error'), ...time, source: z.enum(['error', 'unhandledrejection']),
  errorType: z.enum(['Error', 'TypeError', 'RangeError', 'ReferenceError', 'SyntaxError', 'URIError', 'EvalError', 'Unknown']),
  message: nullableText(1000), file: z.nullable(SafeUrlSchema), line: z.nullable(positive), column: z.nullable(positive),
});
export const NavigationSchema = z.strictObject({
  kind: z.literal('navigation'), ...time, source: z.enum(['initial', 'push', 'replace', 'pop', 'hash']), url: SafeUrlSchema,
});
export const SemanticEventSchema = z.union([ActionSchema, NetworkSchema, ErrorSchema, NavigationSchema]);
export type SemanticEvent = z.infer<typeof SemanticEventSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type NetworkEvent = z.infer<typeof NetworkSchema>;
export type ErrorEvent = z.infer<typeof ErrorSchema>;
export type Locator = z.infer<typeof LocatorSchema>;

// rrweb's sanitized JSON data retains its version-specific node/event structure.
// This envelope intentionally excludes plugin/custom events and arbitrary extensions.
export const ReplayEventSchema = z.strictObject({
  type: z.number().check(z.int(), z.gte(0), z.lte(4)), timestamp: positive, data: z.json(),
});
export type ReplayEvent = z.infer<typeof ReplayEventSchema>;
export const StopReasonSchema = z.enum(['manual', 'duration-limit', 'size-limit', 'event-limit', 'navigation', 'recorder-error']);
export type StopReason = z.infer<typeof StopReasonSchema>;
export const RecordingSchema = z.strictObject({
  version: z.literal(RECORDING_VERSION), id: z.uuid(), projectId: z.uuid(),
  presentation: z.optional(z.literal(PRESENTATION_VERSION)),
  captureMode: z.optional(z.enum(['masked-values','full'])),
  startedAt: positive, durationMs: positive, initialUrl: SafeUrlSchema,
  stopReason: StopReasonSchema, truncated: z.boolean(), hasFullSnapshot: z.boolean(), filteredReplayEvents: positive,
  replay: z.array(ReplayEventSchema).check(z.maxLength(20000)),
  events: z.array(SemanticEventSchema).check(z.maxLength(20000)),
});
export type Recording = z.infer<typeof RecordingSchema>;
export const MAX_SUBMISSION_BYTES = 5_000_000;
export const ReportSubmissionSchema = z.strictObject({
  version: z.literal(1), title: text(120).check(z.minLength(1)), description: text(2000), recording: RecordingSchema,
});
export type ReportSubmission = z.infer<typeof ReportSubmissionSchema>;
export const SubmissionReceiptSchema = z.strictObject({ reportId: z.uuid(), duplicate: z.boolean() });
export type SubmissionReceipt = z.infer<typeof SubmissionReceiptSchema>;
