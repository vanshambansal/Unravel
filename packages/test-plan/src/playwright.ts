import { TestPlanSchema, type ExportMode, type PlanLocator } from './schema.js';
import { planIssues } from './validation.js';

export function exportPlaywright(input: unknown, mode: ExportMode = 'regression'): string {
  const plan = TestPlanSchema.parse(input),
    issues = planIssues(plan, mode);
  if (issues.length) throw new Error(issues.join('\n'));
  const assertions = mode === 'regression' ? plan.assertions : [];
  const needsOrigin = assertions.some((a) => a.kind === 'response' || a.kind === 'url');
  const lines = [
    `import { test${assertions.length ? ', expect' : ''} } from '@playwright/test';`,
    '',
    '// Set use.baseURL in your Playwright configuration. Review locators and safe test data.',
    mode === 'reproduction'
      ? '// Reproduction only: repeats actions; does not verify that the reported bug is fixed.'
      : '// Regression: expected results were supplied and confirmed by the developer.',
    `test('reported ${mode}', async ({ page${needsOrigin ? ', baseURL' : ''} }) => {`,
  ];
  if (assertions.some((a) => a.kind === 'response' || a.kind === 'url'))
    lines.push(
      "  if (!baseURL) throw new Error('Configure use.baseURL before running this test.');",
    );
  if (assertions.some((a) => a.kind === 'no-page-errors'))
    lines.push(
      '  const pageErrors: string[] = [];',
      "  page.on('pageerror', error => pageErrors.push(error.message));",
    );
  lines.push(`  await page.goto(${literal(plan.initialPath)});`);
  const included = plan.steps.filter((step) => step.included);
  for (const step of included) {
    assertions.forEach((assertion, i) => {
      if (
        assertion.kind === 'response' &&
        (assertion.afterStepId ?? included.at(-1)!.id) === step.id
      )
        lines.push(
          `  const startedRequests${i} = new WeakSet<object>();`,
          `  const trackRequest${i} = (request: object) => { startedRequests${i}.add(request); };`,
          `  page.on('request', trackRequest${i});`,
          `  const response${i} = page.waitForResponse(response => {`,
          '    const url = new URL(response.url());',
          `    return startedRequests${i}.has(response.request()) && url.origin === new URL(baseURL!).origin && url.pathname === ${literal(assertion.path)} && response.request().method() === ${literal(assertion.method)};`,
          `  }).then(response => response.status(), () => null).finally(() => page.off('request', trackRequest${i}));`,
        );
    });
    if (step.action === 'navigate') {
      lines.push(`  await page.goto(${literal(step.value!)});`);
      continue;
    }
    const locator = playwrightLocator(step.locator);
    lines.push(
      `  await ${locator}.${step.action === 'click' ? 'click()' : step.action === 'fill' ? `fill(${literal(step.value!)})` : step.action === 'select' ? `selectOption(${literal(step.values ?? step.value!)})` : step.value === 'true' ? 'check()' : 'uncheck()'};`,
    );
  }
  assertions.forEach((assertion, i) => {
    if (assertion.kind === 'text')
      lines.push(
        `  await expect(${playwrightLocator(assertion.locator)}).toHaveText(${literal(assertion.text)});`,
      );
    if (assertion.kind === 'visible')
      lines.push(`  await expect(${playwrightLocator(assertion.locator)}).toBeVisible();`);
    if (assertion.kind === 'url')
      lines.push(
        `  await expect(page).toHaveURL(new URL(${literal(assertion.path)}, baseURL).href);`,
      );
    if (assertion.kind === 'response')
      lines.push(
        `  expect(await response${i}, ${literal(`${assertion.method} ${assertion.path} response status`)}).toBe(${assertion.status});`,
      );
  });
  if (assertions.some((a) => a.kind === 'no-page-errors'))
    lines.push(
      "  expect(pageErrors, 'Uncaught errors during reproduced actions; delayed errors are outside this check').toEqual([]);",
    );
  lines.push('});', '');
  return lines.join('\n');
}
function literal(value: string | string[]): string {
  return JSON.stringify(value)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
function playwrightLocator(locator: PlanLocator): string {
  if (locator.kind === 'testId') return `page.getByTestId(${literal(locator.value)})`;
  if (locator.kind === 'label')
    return `page.getByLabel(${literal(locator.value)}, { exact: true })`;
  if (locator.kind === 'text') return `page.getByText(${literal(locator.value)}, { exact: true })`;
  if (locator.kind === 'role')
    return `page.getByRole(${literal(locator.value)}, ${locator.name ? `{ name: ${literal(locator.name)}, exact: true }` : '{}'})`;
  return `page.locator(${literal(locator.value)})`;
}
