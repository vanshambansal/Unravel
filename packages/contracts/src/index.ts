import * as z from 'zod/mini';

export const RECORDING_VERSION = 1 as const;
const text = (max: number) => z.string().check(z.maxLength(max));
const positive = z.number().check(z.gte(0));
const nullableText = (max: number) => z.nullable(text(max));
export const SafeUrlSchema = z.strictObject({
  origin: text(512).check(z.refine(value => { try { const url = new URL(value); return /^https?:$/.test(url.protocol) && url.origin === value; } catch { return false; } }, 'Expected an HTTP(S) origin')),
  path: z.nullable(text(2048).check(z.refine(value => value.startsWith('/') && !/[?#\\\s]/.test(value), 'Expected a path without query or fragment'))),
});
export type SafeUrl = z.infer<typeof SafeUrlSchema>;

export const LocatorSchema = z.union([
  z.strictObject({ kind: z.literal('testId'), value: text(120) }),
  z.strictObject({ kind: z.literal('unresolved'), tag: text(32) }),
]);
const time = { at: positive };
export const ActionSchema = z.strictObject({
  kind: z.literal('action'), ...time,
  action: z.enum(['click', 'fill', 'select', 'check', 'submit']),
  target: LocatorSchema, value: nullableText(10000), redacted: z.boolean(),
});
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
  startedAt: positive, durationMs: positive, initialUrl: SafeUrlSchema,
  stopReason: StopReasonSchema, truncated: z.boolean(), hasFullSnapshot: z.boolean(), filteredReplayEvents: positive,
  replay: z.array(ReplayEventSchema).check(z.maxLength(20000)),
  events: z.array(SemanticEventSchema).check(z.maxLength(20000)),
});
export type Recording = z.infer<typeof RecordingSchema>;
