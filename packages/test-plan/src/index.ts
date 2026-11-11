import * as z from 'zod/mini';
import type { Recording, SemanticEvent } from '@unravel/contracts';
import { parse as parseSelector, type Selector } from 'css-what';

const text = (max: number) => z.string().check(z.maxLength(max));
export const PlanLocatorSchema = z.strictObject({ kind: z.enum(['testId','label','text','role','css','unresolved']), value: text(500), name: text(200) });
const legacyStep = { id: text(80), action: z.enum(['click','fill','select','check','navigate','unsupported']), locator: PlanLocatorSchema, value: z.nullable(text(10000)), note: text(500) };
export const PlanStepSchema = z.strictObject({ ...legacyStep, included: z.boolean(), sourceAt: z.nullable(z.number().check(z.gte(0))) });
const textAssertion = { id: text(80), locator: PlanLocatorSchema, text: text(2000) };
export const PlanAssertionSchema = z.union([
  z.strictObject({ ...textAssertion, kind: z.literal('text') }),
  z.strictObject({ id: text(80), kind: z.literal('visible'), locator: PlanLocatorSchema }),
  z.strictObject({ id: text(80), kind: z.literal('url'), path: text(2048) }),
  // Drafts can contain an incomplete status. Regression validation enforces 100-599.
  z.strictObject({ id: text(80), kind: z.literal('response'), path: text(2048), method: z.enum(['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS']), status: z.number().check(z.int(), z.gte(0), z.lte(999)), afterStepId: z.optional(text(80)) }),
  z.strictObject({ id: text(80), kind: z.literal('no-page-errors') }),
]);
const currentSchema = z.strictObject({ version: z.literal(2), initialPath: text(2048), steps: z.array(PlanStepSchema).check(z.maxLength(100)), assertions: z.array(PlanAssertionSchema).check(z.maxLength(20)), expectedBehaviorConfirmed: z.boolean() });
const legacySchema = z.strictObject({ version: z.literal(1), initialPath: text(2048), steps: z.array(z.strictObject(legacyStep)).check(z.maxLength(100)), assertions: z.array(z.strictObject(textAssertion)).check(z.maxLength(20)), expectedBehaviorConfirmed: z.boolean() });
/** Read old plans without rewriting stored evidence or advancing their revision. */
export const TestPlanSchema = z.pipe(z.union([currentSchema, legacySchema]), z.transform(value => value.version === 2 ? value : {
  ...value, version: 2 as const, steps: value.steps.map(step => ({ ...step, included: true, sourceAt: null })), assertions: value.assertions.map(assertion => ({ ...assertion, kind: 'text' as const })),
})).check(z.refine(plan => {
  const ids = [...plan.steps, ...plan.assertions].map(item => item.id);
  return ids.every(id => Boolean(id.trim())) && new Set(ids).size === ids.length;
}, 'Step and assertion IDs must be nonempty and unique.'));
export type TestPlan = z.infer<typeof TestPlanSchema>;
export type PlanLocator = z.infer<typeof PlanLocatorSchema>;
export type PlanStep = z.infer<typeof PlanStepSchema>;
export type PlanAssertion = z.infer<typeof PlanAssertionSchema>;
export type ExportMode = 'reproduction' | 'regression';
const roles = new Set(['button','textbox','checkbox','combobox','link','status','alert','heading','radio','option']);
export const emptyLocator = (): PlanLocator => ({ kind: 'unresolved', value: '', name: '' });
export function generatePlan(recording: Pick<Recording, 'initialUrl'> & { events: SemanticEvent[] }): TestPlan {
  const steps: PlanStep[] = []; let lastActionAt = -1000;
  for (const event of [...recording.events].sort((a,b) => a.at - b.at)) {
    if (event.kind === 'navigation' && event.source !== 'initial') {
      const prior = steps.at(-1);
      // A same-site transition caused by a recent interaction is evidence, not another click.
      if (event.source !== 'pop' && event.url.origin === recording.initialUrl.origin && prior && ['click','select','check'].includes(prior.action) && event.at - lastActionAt <= 2500) continue;
      const path = event.url.origin === recording.initialUrl.origin ? event.url.path : null;
      steps.push({ id: `step-${steps.length + 1}`, action: path ? 'navigate' : 'unsupported', locator: emptyLocator(), value: path, note: path ? 'Recorded same-site navigation.' : 'Navigation destination was masked or outside this site. Supply a safe path or remove this step.', included: true, sourceAt: event.at });
    }
    if (event.kind !== 'action') continue;
    const prior = steps.at(-1);
    const locator: PlanLocator = event.target.kind !== 'unresolved' ? { kind: event.target.kind, value: event.target.value, name: '' } : emptyLocator();
    const sameTarget = prior && locator.kind !== 'unresolved' && JSON.stringify(prior.locator) === JSON.stringify(locator);
    if (event.action === 'submit' && prior?.action === 'click' && event.at - lastActionAt <= 250 && (sameTarget || event.target.kind === 'unresolved' && event.target.tag === 'form')) continue;
    const submitControl = event.action === 'submit' && (locator.kind === 'testId' || locator.kind === 'css' && / > (?:button|input):nth-of-type\(\d+\)$/.test(locator.value));
    const step: PlanStep = { id: `step-${steps.length + 1}`, action: event.action === 'submit' ? submitControl ? 'click' : 'unsupported' : event.action, locator, value: event.redacted ? null : event.value, note: event.action === 'submit' && !submitControl ? 'No submit control was identified. Choose an action or remove this step.' : event.redacted ? 'Recorded value was masked. Supply a safe test value.' : '', included: true, sourceAt: event.at };
    // Unknown targets are not necessarily the same element. Never merge their input.
    if (sameTarget && (step.action === 'fill' && ['fill','click'].includes(prior.action) || step.action === 'check' && prior.action === 'click')) { step.id = prior.id; steps[steps.length - 1] = step; }
    else steps.push(step);
    lastActionAt = event.at;
    if (steps.length > 100) break;
  }
  if (steps.length > 100) return { version: 2, initialPath: recording.initialUrl.path ?? '', steps: [{ id: 'unsupported-capture', action: 'unsupported', locator: emptyLocator(), value: null, note: 'More than 100 steps. Create a shorter plan or edit the JSON deliberately.', included: true, sourceAt: null }], assertions: [], expectedBehaviorConfirmed: false };
  return { version: 2, initialPath: recording.initialUrl.path ?? '', steps, assertions: [], expectedBehaviorConfirmed: false };
}
const relativePath = (value: string) => value.startsWith('/') && !value.startsWith('//') && ![...value].some(c => c === '\\' || c.charCodeAt(0) <= 32 || c.charCodeAt(0) === 127);
export function locatorIssue(locator: PlanLocator): string | null {
  if (locator.kind === 'unresolved' || !locator.value.trim() || (locator.kind === 'role' && !roles.has(locator.value))) return 'Identify the element to use when this script runs.';
  if (locator.kind === 'css') {
    try { if (!validSelectors(parseSelector(locator.value))) return 'Use a supported CSS selector; pseudo-elements and custom selector engines are not supported.'; }
    catch { return 'The CSS selector is not valid. Check brackets, quotes and element names.'; }
  }
  return null;
}
function validSelectors(groups: Selector[][]): boolean {
  const simple = new Set(['scope','root','empty','first-child','last-child','only-child','first-of-type','last-of-type','only-of-type','checked','disabled','enabled','required','optional','read-only','read-write','focus','focus-within','focus-visible','hover','active','link','any-link','visited','valid','invalid','placeholder-shown']);
  return groups.length > 0 && groups.every(group => group.length > 0 && group.every((token, index) => {
    if (['parent','column-combinator','pseudo-element'].includes(token.type)) return false;
    if (['child','adjacent','sibling','descendant'].includes(token.type)) return index > 0 && index < group.length - 1;
    if (token.type !== 'pseudo') return true;
    if (simple.has(token.name)) return token.data === null;
    if (['is','where','not','has'].includes(token.name)) return Array.isArray(token.data) && validSelectors(token.data);
    return ['nth-child','nth-last-child','nth-of-type','nth-last-of-type'].includes(token.name) && typeof token.data === 'string' && /^(?:odd|even|[+-]?\d+|[+-]?\d*n(?:\s*[+-]\s*\d+)?)$/i.test(token.data.trim());
  }));
}
export function stepIssues(step: PlanStep): string[] {
  if (!step.included) return [];
  const issues: string[] = [];
  if (step.action === 'unsupported') issues.push('Choose a supported action, or exclude this step.');
  if (step.action === 'navigate') { if (!relativePath(step.value ?? '')) issues.push('Enter a safe relative destination path.'); return issues; }
  const problem = locatorIssue(step.locator); if (problem) issues.push(problem);
  if (['fill','select'].includes(step.action) && step.value === null) issues.push('Supply a safe replacement value.');
  if (step.action === 'check' && !['true','false'].includes(step.value ?? '')) issues.push('Check value must be true or false.');
  return issues;
}
export function assertionIssues(assertion: PlanAssertion): string[] {
  if (assertion.kind === 'text' || assertion.kind === 'visible') {
    const problem = locatorIssue(assertion.locator), issues = problem ? [problem] : [];
    if (assertion.kind === 'text' && !assertion.text.trim()) issues.push('Enter the expected text.'); return issues;
  }
  if (assertion.kind === 'url') return relativePath(assertion.path) ? [] : ['Enter a relative destination path, such as /account.'];
  if (assertion.kind === 'response') {
    const issues = relativePath(assertion.path) && !/[?#]/.test(assertion.path) ? [] : ['Enter a same-origin request path without query or fragment.'];
    if (!Number.isInteger(assertion.status) || assertion.status < 100 || assertion.status > 599) issues.push('Choose an HTTP status from 100 to 599.');
    return issues;
  }
  return [];
}
export function planIssues(plan: TestPlan, mode: ExportMode = 'regression'): string[] {
  const issues: string[] = [];
  if (!relativePath(plan.initialPath)) issues.push('Initial path must be a relative path beginning with one slash and no whitespace or control characters.');
  if (!plan.steps.some(step => step.included)) issues.push('Include at least one reproduction action.');
  plan.steps.forEach((step, i) => stepIssues(step).forEach(issue => issues.push(`Step ${i + 1}: ${issue}`)));
  if (mode === 'regression') {
    if (!plan.assertions.length) issues.push('Add an expected result; a recorded failure is not the expected result.');
    plan.assertions.forEach((assertion, i) => assertionIssues(assertion).forEach(issue => issues.push(`Expected result ${i + 1}: ${issue}`)));
    plan.assertions.forEach((assertion, i) => { if (assertion.kind === 'response' && assertion.afterStepId && !plan.steps.some(step => step.id === assertion.afterStepId && step.included)) issues.push(`Expected result ${i + 1}: choose an included action that triggers this request.`); });
    if (plan.assertions.some(assertion => assertion.kind === 'no-page-errors') && !plan.assertions.some(assertion => assertion.kind !== 'no-page-errors')) issues.push('Add a visible result, destination or response check to define when the page-error observation finishes.');
    if (!plan.expectedBehaviorConfirmed) issues.push('Confirm that these assertions describe the intended correct behavior.');
  } return issues;
}
function targetName(locator: PlanLocator): string {
  if (locator.kind === 'unresolved') return 'unknown element';
  if (locator.kind === 'css' && /^body > /.test(locator.value)) { const tag = locator.value.match(/ > ([a-z0-9]+):nth-of-type\(\d+\)$/)?.[1]; return tag === 'input' || tag === 'textarea' ? 'the input field' : tag === 'a' ? 'the link' : tag === 'button' ? 'the button' : `the ${tag ?? 'recorded'} element`; }
  if (locator.kind === 'role') return locator.name ? `${locator.value} ${JSON.stringify(locator.name)}` : locator.value;
  return `${locator.kind === 'testId' ? 'test ID' : locator.kind === 'css' ? 'selector' : locator.kind} ${JSON.stringify(locator.value)}`;
}
export function describeStep(step: PlanStep): string {
  const target = targetName(step.locator);
  if (step.action === 'navigate') return `Open ${step.value || '[destination needed]'}`;
  if (step.action === 'unsupported') return 'Review unsupported action';
  if (step.action === 'fill') return `Enter ${step.value === null ? 'a safe test value' : JSON.stringify(step.value)} into ${target}`;
  if (step.action === 'select') return `Select ${step.value === null ? 'a safe option' : JSON.stringify(step.value)} in ${target}`;
  if (step.action === 'check') return `${step.value === 'false' ? 'Uncheck' : 'Check'} ${target}`;
  return `Click ${target}`;
}
export function describeAssertion(assertion: PlanAssertion): string {
  if (assertion.kind === 'text') return `Expect ${targetName(assertion.locator)} to show ${JSON.stringify(assertion.text)}`;
  if (assertion.kind === 'visible') return `Expect ${targetName(assertion.locator)} to be visible`;
  if (assertion.kind === 'url') return `Expect navigation to ${assertion.path || '[destination required]'}`;
  if (assertion.kind === 'response') return `Expect ${assertion.method} ${assertion.path || '[path required]'} to return HTTP ${assertion.status}`;
  return 'Expect no uncaught page errors during the reproduced actions';
}
export function readableSteps(plan: TestPlan): string[] {
  return [`Open ${plan.initialPath || '[initial path required]'}`, ...plan.steps.filter(step => step.included).map(describeStep), ...plan.assertions.map(describeAssertion)];
}
export function exportPlaywright(input: unknown, mode: ExportMode = 'regression'): string {
  const plan = TestPlanSchema.parse(input), issues = planIssues(plan, mode);
  if (issues.length) throw new Error(issues.join('\n'));
  const assertions = mode === 'regression' ? plan.assertions : [];
  const needsOrigin = assertions.some(a => a.kind === 'response' || a.kind === 'url');
  const lines = [`import { test${assertions.length ? ', expect' : ''} } from '@playwright/test';`, '', '// Set use.baseURL in your Playwright configuration. Review locators and safe test data.', mode === 'reproduction' ? '// Reproduction only: repeats actions; does not verify that the reported bug is fixed.' : '// Regression: expected results were supplied and confirmed by the developer.', `test('reported ${mode}', async ({ page${needsOrigin ? ', baseURL' : ''} }) => {`];
  if (assertions.some(a => a.kind === 'response' || a.kind === 'url')) lines.push("  if (!baseURL) throw new Error('Configure use.baseURL before running this test.');");
  if (assertions.some(a => a.kind === 'no-page-errors')) lines.push('  const pageErrors: string[] = [];', "  page.on('pageerror', error => pageErrors.push(error.message));");
  lines.push(`  await page.goto(${literal(plan.initialPath)});`);
  const included = plan.steps.filter(step => step.included);
  for (const step of included) {
    assertions.forEach((assertion, i) => {
      if (assertion.kind === 'response' && (assertion.afterStepId ?? included.at(-1)!.id) === step.id) lines.push(`  const startedRequests${i} = new WeakSet<object>();`, `  const trackRequest${i} = (request: object) => { startedRequests${i}.add(request); };`, `  page.on('request', trackRequest${i});`, `  const response${i} = page.waitForResponse(response => {`, '    const url = new URL(response.url());', `    return startedRequests${i}.has(response.request()) && url.origin === new URL(baseURL!).origin && url.pathname === ${literal(assertion.path)} && response.request().method() === ${literal(assertion.method)};`, `  }).then(response => response.status(), () => null).finally(() => page.off('request', trackRequest${i}));`);
    });
    if (step.action === 'navigate') { lines.push(`  await page.goto(${literal(step.value!)});`); continue; }
    const locator = playwrightLocator(step.locator);
    lines.push(`  await ${locator}.${step.action === 'click' ? 'click()' : step.action === 'fill' ? `fill(${literal(step.value!)})` : step.action === 'select' ? `selectOption(${literal(step.value!)})` : step.value === 'true' ? 'check()' : 'uncheck()'};`);
  }
  assertions.forEach((assertion, i) => {
    if (assertion.kind === 'text') lines.push(`  await expect(${playwrightLocator(assertion.locator)}).toHaveText(${literal(assertion.text)});`);
    if (assertion.kind === 'visible') lines.push(`  await expect(${playwrightLocator(assertion.locator)}).toBeVisible();`);
    if (assertion.kind === 'url') lines.push(`  await expect(page).toHaveURL(new URL(${literal(assertion.path)}, baseURL).href);`);
    if (assertion.kind === 'response') lines.push(`  expect(await response${i}, ${literal(`${assertion.method} ${assertion.path} response status`)}).toBe(${assertion.status});`);
  });
  if (assertions.some(a => a.kind === 'no-page-errors')) lines.push("  expect(pageErrors, 'Uncaught errors during reproduced actions; delayed errors are outside this check').toEqual([]);");
  lines.push('});', ''); return lines.join('\n');
}
function literal(value: string): string { return JSON.stringify(value).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'); }
function playwrightLocator(locator: PlanLocator): string {
  if (locator.kind === 'testId') return `page.getByTestId(${literal(locator.value)})`;
  if (locator.kind === 'label') return `page.getByLabel(${literal(locator.value)}, { exact: true })`;
  if (locator.kind === 'text') return `page.getByText(${literal(locator.value)}, { exact: true })`;
  if (locator.kind === 'role') return `page.getByRole(${literal(locator.value)}, ${locator.name ? `{ name: ${literal(locator.name)}, exact: true }` : '{}'})`;
  return `page.locator(${literal(locator.value)})`;
}
