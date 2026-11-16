import type { PlanLocator, PlanStep, PlanAssertion, TestPlan } from './schema.js';

function targetName(locator: PlanLocator): string {
  if (locator.kind === 'unresolved') return 'unknown element';
  if (locator.kind === 'css' && /^body > /.test(locator.value)) {
    const tag = locator.value.match(/ > ([a-z0-9]+):nth-of-type\(\d+\)$/)?.[1];
    return tag === 'input' || tag === 'textarea'
      ? 'the input field'
      : tag === 'a'
        ? 'the link'
        : tag === 'button'
          ? 'the button'
          : `the ${tag ?? 'recorded'} element`;
  }
  if (locator.kind === 'role')
    return locator.name ? `${locator.value} ${JSON.stringify(locator.name)}` : locator.value;
  return `${locator.kind === 'testId' ? 'test ID' : locator.kind === 'css' ? 'selector' : locator.kind} ${JSON.stringify(locator.value)}`;
}
export function describeStep(step: PlanStep): string {
  const target = targetName(step.locator);
  if (step.action === 'navigate') return `Open ${step.value || '[destination needed]'}`;
  if (step.action === 'unsupported') return 'Review unsupported action';
  if (step.action === 'fill')
    return `Enter ${step.value === null ? 'a safe test value' : JSON.stringify(step.value)} into ${target}`;
  if (step.action === 'select')
    return `Select ${step.values !== undefined ? (step.values === null ? 'safe options' : step.values.length ? step.values.map((value) => JSON.stringify(value)).join(', ') : 'no options') : step.value === null ? 'a safe option' : JSON.stringify(step.value)} in ${target}`;
  if (step.action === 'check') return `${step.value === 'false' ? 'Uncheck' : 'Check'} ${target}`;
  return `Click ${target}`;
}
export function describeAssertion(assertion: PlanAssertion): string {
  if (assertion.kind === 'text')
    return `Expect ${targetName(assertion.locator)} to show ${JSON.stringify(assertion.text)}`;
  if (assertion.kind === 'visible') return `Expect ${targetName(assertion.locator)} to be visible`;
  if (assertion.kind === 'url')
    return `Expect navigation to ${assertion.path || '[destination required]'}`;
  if (assertion.kind === 'response')
    return `Expect ${assertion.method} ${assertion.path || '[path required]'} to return HTTP ${assertion.status}`;
  return 'Expect no uncaught page errors during the reproduced actions';
}
export function readableSteps(plan: TestPlan): string[] {
  return [
    `Open ${plan.initialPath || '[initial path required]'}`,
    ...plan.steps.filter((step) => step.included).map(describeStep),
    ...plan.assertions.map(describeAssertion),
  ];
}
