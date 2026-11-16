import type { Recording, SemanticEvent } from '@unravel/contracts';
import { emptyLocator, type TestPlan, type PlanStep, type PlanLocator } from './schema.js';

export function generatePlan(
  recording: Pick<Recording, 'initialUrl'> & { events: SemanticEvent[] },
): TestPlan {
  const steps: PlanStep[] = [];
  let lastActionAt = -1000;
  for (const event of [...recording.events].sort((a, b) => a.at - b.at)) {
    // Navigation events also add steps and bypass the action branch below.
    // Stop before processing more evidence once either path exceeds the cap.
    if (steps.length > 100) break;
    if (event.kind === 'navigation' && event.source !== 'initial') {
      const prior = steps.at(-1);
      // A same-site transition caused by a recent interaction is evidence, not another click.
      if (
        event.source !== 'pop' &&
        event.url.origin === recording.initialUrl.origin &&
        prior &&
        ['click', 'select', 'check'].includes(prior.action) &&
        event.at - lastActionAt <= 2500
      )
        continue;
      const path = event.url.origin === recording.initialUrl.origin ? event.url.path : null;
      steps.push({
        id: `step-${steps.length + 1}`,
        action: path ? 'navigate' : 'unsupported',
        locator: emptyLocator(),
        value: path,
        note: path
          ? 'Recorded same-site navigation.'
          : 'Navigation destination was masked or outside this site. Supply a safe path or remove this step.',
        included: true,
        sourceAt: event.at,
      });
    }
    if (event.kind !== 'action') continue;
    const prior = steps.at(-1);
    const locator: PlanLocator =
      event.target.kind !== 'unresolved'
        ? { kind: event.target.kind, value: event.target.value, name: '' }
        : emptyLocator();
    const sameTarget =
      prior &&
      locator.kind !== 'unresolved' &&
      JSON.stringify(prior.locator) === JSON.stringify(locator);
    if (
      event.action === 'submit' &&
      prior?.action === 'click' &&
      event.at - lastActionAt <= 250 &&
      (sameTarget || (event.target.kind === 'unresolved' && event.target.tag === 'form'))
    )
      continue;
    const submitControl =
      event.action === 'submit' &&
      (locator.kind === 'testId' ||
        (locator.kind === 'css' && / > (?:button|input):nth-of-type\(\d+\)$/.test(locator.value)));
    const step: PlanStep = {
      id: `step-${steps.length + 1}`,
      action: event.action === 'submit' ? (submitControl ? 'click' : 'unsupported') : event.action,
      locator,
      value: event.redacted ? null : event.value,
      ...(event.values !== undefined ? { values: event.redacted ? null : event.values } : {}),
      note:
        event.action === 'submit' && !submitControl
          ? 'No submit control was identified. Choose an action or remove this step.'
          : event.redacted
            ? 'Recorded value was masked. Supply a safe test value.'
            : '',
      included: true,
      sourceAt: event.at,
    };
    // Unknown targets are not necessarily the same element. Never merge their input.
    if (
      sameTarget &&
      ((step.action === 'fill' && ['fill', 'click'].includes(prior.action)) ||
        (step.action === 'check' && prior.action === 'click'))
    ) {
      step.id = prior.id;
      steps[steps.length - 1] = step;
    } else steps.push(step);
    lastActionAt = event.at;
    if (steps.length > 100) break;
  }
  if (steps.length > 100)
    return {
      version: 2,
      initialPath: recording.initialUrl.path ?? '',
      steps: [
        {
          id: 'unsupported-capture',
          action: 'unsupported',
          locator: emptyLocator(),
          value: null,
          note: 'More than 100 steps. Create a shorter plan or edit the JSON deliberately.',
          included: true,
          sourceAt: null,
        },
      ],
      assertions: [],
      expectedBehaviorConfirmed: false,
    };
  return {
    version: 2,
    initialPath: recording.initialUrl.path ?? '',
    steps,
    assertions: [],
    expectedBehaviorConfirmed: false,
  };
}
