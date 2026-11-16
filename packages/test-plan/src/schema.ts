import * as z from 'zod/mini';

const text = (max: number) => z.string().check(z.maxLength(max));
export const PlanLocatorSchema = z.strictObject({
  kind: z.enum(['testId', 'label', 'text', 'role', 'css', 'unresolved']),
  value: text(500),
  name: text(200),
});
const legacyStep = {
  id: text(80),
  action: z.enum(['click', 'fill', 'select', 'check', 'navigate', 'unsupported']),
  locator: PlanLocatorSchema,
  value: z.nullable(text(10000)),
  note: text(500),
};
export const PlanStepSchema = z
  .strictObject({
    ...legacyStep,
    included: z.boolean(),
    sourceAt: z.nullable(z.number().check(z.gte(0))),
    values: z.optional(z.nullable(z.array(text(10000)).check(z.maxLength(100)))),
  })
  .check(
    z.refine(
      (step) => step.values === undefined || (step.action === 'select' && step.value === null),
      'Multiple selections require a select action and no scalar value.',
    ),
  );
const textAssertion = { id: text(80), locator: PlanLocatorSchema, text: text(2000) };
export const PlanAssertionSchema = z.union([
  z.strictObject({ ...textAssertion, kind: z.literal('text') }),
  z.strictObject({ id: text(80), kind: z.literal('visible'), locator: PlanLocatorSchema }),
  z.strictObject({ id: text(80), kind: z.literal('url'), path: text(2048) }),
  // Drafts can contain an incomplete status. Regression validation enforces 100-599.
  z.strictObject({
    id: text(80),
    kind: z.literal('response'),
    path: text(2048),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
    status: z.number().check(z.int(), z.gte(0), z.lte(999)),
    afterStepId: z.optional(text(80)),
  }),
  z.strictObject({ id: text(80), kind: z.literal('no-page-errors') }),
]);
const currentSchema = z.strictObject({
  version: z.literal(2),
  initialPath: text(2048),
  steps: z.array(PlanStepSchema).check(z.maxLength(100)),
  assertions: z.array(PlanAssertionSchema).check(z.maxLength(20)),
  expectedBehaviorConfirmed: z.boolean(),
});
const legacySchema = z.strictObject({
  version: z.literal(1),
  initialPath: text(2048),
  steps: z.array(z.strictObject(legacyStep)).check(z.maxLength(100)),
  assertions: z.array(z.strictObject(textAssertion)).check(z.maxLength(20)),
  expectedBehaviorConfirmed: z.boolean(),
});
/** Read old plans without rewriting stored evidence or advancing their revision. */
export const TestPlanSchema = z
  .pipe(
    z.union([currentSchema, legacySchema]),
    z.transform((value) =>
      value.version === 2
        ? value
        : {
            ...value,
            version: 2 as const,
            steps: value.steps.map((step) => ({
              ...step,
              included: true,
              sourceAt: null,
              values: undefined as string[] | null | undefined,
            })),
            assertions: value.assertions.map((assertion) => ({
              ...assertion,
              kind: 'text' as const,
            })),
          },
    ),
  )
  .check(
    z.refine((plan) => {
      const ids = [...plan.steps, ...plan.assertions].map((item) => item.id);
      return ids.every((id) => Boolean(id.trim())) && new Set(ids).size === ids.length;
    }, 'Step and assertion IDs must be nonempty and unique.'),
  );
export type TestPlan = z.infer<typeof TestPlanSchema>;
export type PlanLocator = z.infer<typeof PlanLocatorSchema>;
export type PlanStep = z.infer<typeof PlanStepSchema>;
export type PlanAssertion = z.infer<typeof PlanAssertionSchema>;
export type ExportMode = 'reproduction' | 'regression';
export const emptyLocator = (): PlanLocator => ({ kind: 'unresolved', value: '', name: '' });
