import { parse as parseSelector, type Selector } from 'css-what';
import type { PlanLocator, PlanStep, PlanAssertion, TestPlan, ExportMode } from './schema.js';

const roles = new Set([
  'button',
  'textbox',
  'checkbox',
  'combobox',
  'link',
  'status',
  'alert',
  'heading',
  'radio',
  'option',
]);
const relativePath = (value: string) =>
  value.startsWith('/') &&
  !value.startsWith('//') &&
  ![...value].some((c) => c === '\\' || c.charCodeAt(0) <= 32 || c.charCodeAt(0) === 127);
export function locatorIssue(locator: PlanLocator): string | null {
  if (
    locator.kind === 'unresolved' ||
    !locator.value.trim() ||
    (locator.kind === 'role' && !roles.has(locator.value))
  )
    return 'Identify the element to use when this script runs.';
  if (locator.kind === 'css') {
    try {
      if (!validSelectors(parseSelector(locator.value)))
        return 'Use a supported CSS selector; pseudo-elements and custom selector engines are not supported.';
    } catch {
      return 'The CSS selector is not valid. Check brackets, quotes and element names.';
    }
  }
  return null;
}
function validSelectors(groups: Selector[][]): boolean {
  const simple = new Set([
    'scope',
    'root',
    'empty',
    'first-child',
    'last-child',
    'only-child',
    'first-of-type',
    'last-of-type',
    'only-of-type',
    'checked',
    'disabled',
    'enabled',
    'required',
    'optional',
    'read-only',
    'read-write',
    'focus',
    'focus-within',
    'focus-visible',
    'hover',
    'active',
    'link',
    'any-link',
    'visited',
    'valid',
    'invalid',
    'placeholder-shown',
  ]);
  return (
    groups.length > 0 &&
    groups.every(
      (group) =>
        group.length > 0 &&
        group.every((token, index) => {
          if (['parent', 'column-combinator', 'pseudo-element'].includes(token.type)) return false;
          if (['child', 'adjacent', 'sibling', 'descendant'].includes(token.type))
            return index > 0 && index < group.length - 1;
          if (token.type !== 'pseudo') return true;
          if (simple.has(token.name)) return token.data === null;
          if (['is', 'where', 'not', 'has'].includes(token.name))
            return Array.isArray(token.data) && validSelectors(token.data);
          return (
            ['nth-child', 'nth-last-child', 'nth-of-type', 'nth-last-of-type'].includes(
              token.name,
            ) &&
            typeof token.data === 'string' &&
            /^(?:odd|even|[+-]?\d+|[+-]?\d*n(?:\s*[+-]\s*\d+)?)$/i.test(token.data.trim())
          );
        }),
    )
  );
}
export function stepIssues(step: PlanStep): string[] {
  if (!step.included) return [];
  const issues: string[] = [];
  if (step.action === 'unsupported')
    issues.push('Choose a supported action, or exclude this step.');
  if (step.action === 'navigate') {
    if (!relativePath(step.value ?? '')) issues.push('Enter a safe relative destination path.');
    return issues;
  }
  const problem = locatorIssue(step.locator);
  if (problem) issues.push(problem);
  if (
    step.action === 'select' && step.values !== undefined
      ? step.values === null
      : ['fill', 'select'].includes(step.action) && step.value === null
  )
    issues.push('Supply a safe replacement value.');
  if (step.action === 'check' && !['true', 'false'].includes(step.value ?? ''))
    issues.push('Check value must be true or false.');
  return issues;
}
export function assertionIssues(assertion: PlanAssertion): string[] {
  if (assertion.kind === 'text' || assertion.kind === 'visible') {
    const problem = locatorIssue(assertion.locator),
      issues = problem ? [problem] : [];
    if (assertion.kind === 'text' && !assertion.text.trim())
      issues.push('Enter the expected text.');
    return issues;
  }
  if (assertion.kind === 'url')
    return relativePath(assertion.path)
      ? []
      : ['Enter a relative destination path, such as /account.'];
  if (assertion.kind === 'response') {
    const issues =
      relativePath(assertion.path) && !/[?#]/.test(assertion.path)
        ? []
        : ['Enter a same-origin request path without query or fragment.'];
    if (!Number.isInteger(assertion.status) || assertion.status < 100 || assertion.status > 599)
      issues.push('Choose an HTTP status from 100 to 599.');
    return issues;
  }
  return [];
}
export function planIssues(plan: TestPlan, mode: ExportMode = 'regression'): string[] {
  const issues: string[] = [];
  if (!relativePath(plan.initialPath))
    issues.push(
      'Initial path must be a relative path beginning with one slash and no whitespace or control characters.',
    );
  if (!plan.steps.some((step) => step.included))
    issues.push('Include at least one reproduction action.');
  plan.steps.forEach((step, i) =>
    stepIssues(step).forEach((issue) => issues.push(`Step ${i + 1}: ${issue}`)),
  );
  if (mode === 'regression') {
    if (!plan.assertions.length)
      issues.push('Add an expected result; a recorded failure is not the expected result.');
    plan.assertions.forEach((assertion, i) =>
      assertionIssues(assertion).forEach((issue) =>
        issues.push(`Expected result ${i + 1}: ${issue}`),
      ),
    );
    plan.assertions.forEach((assertion, i) => {
      if (
        assertion.kind === 'response' &&
        assertion.afterStepId &&
        !plan.steps.some((step) => step.id === assertion.afterStepId && step.included)
      )
        issues.push(
          `Expected result ${i + 1}: choose an included action that triggers this request.`,
        );
    });
    if (
      plan.assertions.some((assertion) => assertion.kind === 'no-page-errors') &&
      !plan.assertions.some((assertion) => assertion.kind !== 'no-page-errors')
    )
      issues.push(
        'Add a visible result, destination or response check to define when the page-error observation finishes.',
      );
    if (!plan.expectedBehaviorConfirmed)
      issues.push('Confirm that these assertions describe the intended correct behavior.');
  }
  return issues;
}
