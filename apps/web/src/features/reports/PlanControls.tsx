'use client';
import { useLayoutEffect, useId, useRef, type ReactNode } from 'react';
import {
  emptyLocator,
  type PlanLocator,
  type PlanAssertion,
  type PlanStep,
  describeStep,
} from '@unravel/test-plan';

const kinds: [PlanLocator['kind'], string][] = [
  ['testId', 'Test ID'],
  ['label', 'Label'],
  ['role', 'Accessible role'],
  ['text', 'Exact text'],
  ['css', 'CSS selector'],
  ['unresolved', 'Not identified'],
];
export function LocatorEditor({
  locator,
  label,
  onChange,
}: {
  locator: PlanLocator;
  label: string;
  onChange(value: PlanLocator): void;
}) {
  return (
    <fieldset className="plan-locator">
      <legend>Find the element</legend>
      <p className="ui-field-help">
        Prefer a test ID, label or accessible role. Check uniqueness in the target website.
      </p>
      <label>
        Find by
        <select
          aria-label={`${label} locator type`}
          value={locator.kind}
          onChange={(e) => onChange({ ...locator, kind: e.target.value as PlanLocator['kind'] })}
        >
          {kinds.map(([kind, name]) => (
            <option value={kind} key={kind}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label>
        {locator.kind === 'role' ? 'Role' : 'Element identifier'}
        <input
          aria-label={`${label} locator`}
          value={locator.value}
          maxLength={500}
          placeholder={locator.kind === 'role' ? 'button, textbox, status' : 'e.g. submit-question'}
          onChange={(e) => onChange({ ...locator, value: e.target.value })}
        />
      </label>
      {locator.kind === 'role' && (
        <label>
          Accessible name
          <input
            aria-label={`${label} accessible name`}
            value={locator.name}
            maxLength={200}
            onChange={(e) => onChange({ ...locator, name: e.target.value })}
            placeholder="e.g. Submit question"
          />
        </label>
      )}
    </fieldset>
  );
}
export const outcomeNames: Record<PlanAssertion['kind'], string> = {
  text: 'Text appears',
  visible: 'Element is visible',
  url: 'Destination URL',
  response: 'Request response',
  'no-page-errors': 'No uncaught page errors',
};
export function newAssertion(kind: PlanAssertion['kind']): PlanAssertion {
  const id = crypto.randomUUID();
  if (kind === 'text')
    return { id, kind, locator: { kind: 'text', value: '', name: '' }, text: '' };
  if (kind === 'visible') return { id, kind, locator: emptyLocator() };
  if (kind === 'url') return { id, kind, path: '' };
  if (kind === 'response') return { id, kind, method: 'POST', path: '', status: 200 };
  return { id, kind };
}
export function OutcomeFields({
  assertion,
  label,
  steps = [],
  onChange,
}: {
  assertion: PlanAssertion;
  label: string;
  steps?: PlanStep[];
  onChange(value: PlanAssertion): void;
}) {
  if (assertion.kind === 'text')
    return (
      <>
        <label>
          Expected text
          <input
            aria-label={`${label} expected text`}
            value={assertion.text}
            maxLength={2000}
            placeholder="The message or value that should appear"
            onChange={(e) =>
              onChange({
                ...assertion,
                text: e.target.value,
                locator:
                  assertion.locator.kind === 'text' && assertion.locator.value === assertion.text
                    ? { ...assertion.locator, value: e.target.value }
                    : assertion.locator,
              })
            }
          />
        </label>
        <details className="plan-target-details">
          <summary>Choose a specific element</summary>
          <LocatorEditor
            label={label}
            locator={assertion.locator}
            onChange={(locator) => onChange({ ...assertion, locator })}
          />
        </details>
      </>
    );
  if (assertion.kind === 'visible')
    return (
      <LocatorEditor
        label={label}
        locator={assertion.locator}
        onChange={(locator) => onChange({ ...assertion, locator })}
      />
    );
  if (assertion.kind === 'url')
    return (
      <label>
        Expected destination path
        <input
          aria-label={`${label} destination`}
          value={assertion.path}
          maxLength={2048}
          placeholder="/account"
          onChange={(e) => onChange({ ...assertion, path: e.target.value })}
        />
        <span className="ui-field-help">
          Relative to your Playwright baseURL. This checks the final URL, not visual correctness.
        </span>
      </label>
    );
  if (assertion.kind === 'response')
    return (
      <>
        <label>
          Action that triggers this request
          <select
            aria-label={`${label} trigger action`}
            value={assertion.afterStepId ?? steps.filter((step) => step.included).at(-1)?.id ?? ''}
            onChange={(e) => onChange({ ...assertion, afterStepId: e.target.value })}
          >
            {steps
              .filter((step) => step.included)
              .map((step, index) => (
                <option key={step.id} value={step.id}>
                  {index + 1}. {describeStep(step)}
                </option>
              ))}
          </select>
        </label>
        <label>
          Request path
          <input
            aria-label={`${label} request path`}
            value={assertion.path}
            maxLength={2048}
            placeholder="/api/questions"
            onChange={(e) => onChange({ ...assertion, path: e.target.value })}
          />
        </label>
        <div className="plan-paired-fields">
          <label>
            Method
            <select
              aria-label={`${label} method`}
              value={assertion.method}
              onChange={(e) =>
                onChange({ ...assertion, method: e.target.value as typeof assertion.method })
              }
            >
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map((method) => (
                <option key={method}>{method}</option>
              ))}
            </select>
          </label>
          <label>
            Expected status
            <input
              aria-label={`${label} status`}
              type="number"
              min={100}
              max={599}
              value={assertion.status}
              onChange={(e) => {
                const status = Number(e.target.value);
                if (Number.isInteger(status)) onChange({ ...assertion, status });
              }}
            />
          </label>
        </div>
        <p className="ui-field-help">
          Waits for the first matching same-origin response after the selected action begins.
          Queries are ignored. A success status alone may not establish correct behavior.
        </p>
      </>
    );
  return (
    <p className="ui-field-help">
      Checks uncaught page errors from navigation through the end of the actions. HTTP failures,
      caught exceptions and delayed errors are not covered. Add a visible outcome for asynchronous
      completion.
    </p>
  );
}
export function StepFields({
  step,
  label,
  onChange,
}: {
  step: PlanStep;
  label: string;
  onChange(value: PlanStep): void;
}) {
  if (step.action === 'navigate')
    return (
      <>
        <label>
          Action
          <select
            aria-label={`${label} action`}
            value={step.action}
            onChange={(e) => onChange({ ...step, action: e.target.value as PlanStep['action'] })}
          >
            <option value="navigate">Open page</option>
            <option value="click">Click</option>
          </select>
        </label>
        <label>
          Destination path
          <input
            aria-label={`${label} safe value`}
            value={step.value ?? ''}
            onChange={(e) => onChange({ ...step, value: e.target.value })}
          />
        </label>
      </>
    );
  const changeAction = (action: PlanStep['action']) => {
    const { values, ...rest } = step;
    onChange({
      ...rest,
      action,
      ...(action === 'select' && values !== undefined ? { values } : {}),
    });
  };
  const multiple = step.action === 'select' && step.values !== undefined;
  return (
    <>
      <label>
        Action
        <select
          aria-label={`${label} action`}
          value={step.action}
          onChange={(e) => changeAction(e.target.value as PlanStep['action'])}
        >
          {[
            ['click', 'Click'],
            ['fill', 'Enter text'],
            ['select', 'Select option'],
            ['check', 'Check / uncheck'],
            ['navigate', 'Open page'],
            ['unsupported', 'Needs review'],
          ].map(([kind, name]) => (
            <option key={kind} value={kind}>
              {name}
            </option>
          ))}
        </select>
      </label>
      {step.action === 'select' && (
        <label>
          <input
            type="checkbox"
            checked={multiple}
            onChange={(event) =>
              onChange({
                ...step,
                value: event.target.checked ? null : (step.values?.[0] ?? null),
                values: event.target.checked
                  ? step.value === null
                    ? null
                    : [step.value]
                  : undefined,
              })
            }
          />{' '}
          Select multiple options
        </label>
      )}
      {multiple ? (
        <>
          <label>
            Selected option values (one per line)
            <textarea
              aria-label={`${label} selected values`}
              value={step.values?.join('\n') ?? ''}
              rows={4}
              placeholder="Safe option values, one per line"
              onChange={(event) =>
                onChange({
                  ...step,
                  value: null,
                  values: event.target.value ? event.target.value.split('\n') : [],
                })
              }
            />
          </label>
          <span className="ui-field-help">
            Masked options need safe replacements. Use Clear selection to deliberately select none.
          </span>
          <button
            type="button"
            className="product-button secondary"
            onClick={() => onChange({ ...step, value: null, values: [] })}
          >
            Clear selection
          </button>
        </>
      ) : (
        ['fill', 'select', 'check'].includes(step.action) && (
          <label>
            {step.action === 'check' ? 'Checked state' : 'Safe test value'}
            {step.action === 'check' ? (
              <select
                aria-label={`${label} safe value`}
                value={step.value ?? ''}
                onChange={(e) => onChange({ ...step, value: e.target.value })}
              >
                <option value="">Choose a state</option>
                <option value="true">Checked</option>
                <option value="false">Unchecked</option>
              </select>
            ) : (
              <input
                aria-label={`${label} safe value`}
                value={step.value ?? ''}
                maxLength={10000}
                placeholder="Synthetic test data, never credentials"
                onChange={(e) => onChange({ ...step, value: e.target.value })}
              />
            )}
          </label>
        )
      )}
      <LocatorEditor
        label={label}
        locator={step.locator}
        onChange={(locator) => onChange({ ...step, locator })}
      />
    </>
  );
}
/** Native dialog supplies keyboard confinement, Escape and focus restoration. */
export function PlanInspector({
  title,
  disabled,
  children,
  onClose,
  onApply,
}: {
  title: string;
  disabled: boolean;
  children: ReactNode;
  onClose(): void;
  onApply(): void;
}) {
  const headingId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = ref.current!,
      previous = document.activeElement;
    dialog.showModal();
    dialog.querySelector<HTMLElement>('h2')?.focus();
    return () => {
      dialog.close();
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="plan-inspector"
      aria-labelledby={headingId}
      onCancel={(event) => {
        event.preventDefault();
        if (!disabled) onClose();
      }}
    >
      <header>
        <div>
          <h2 id={headingId} tabIndex={-1}>
            {title}
          </h2>
          <p>Edits affect the plan. Recorded evidence stays unchanged.</p>
        </div>
        <button
          className="product-text-link"
          disabled={disabled}
          onClick={onClose}
          aria-label="Close advanced editing"
        >
          Close
        </button>
      </header>
      <fieldset disabled={disabled} className="plan-inspector-body">
        {children}
      </fieldset>
      <footer>
        <p>Apply to the draft, or cancel without changes.</p>
        <div className="product-actions">
          <button className="product-button secondary" disabled={disabled} onClick={onClose}>
            Cancel
          </button>
          <button className="product-button" disabled={disabled} onClick={onApply}>
            Apply changes
          </button>
        </div>
      </footer>
    </dialog>
  );
}

export function PlanPrompt({
  title,
  children,
  actions,
  onClose,
}: {
  title: string;
  children: ReactNode;
  actions: ReactNode;
  onClose(): void;
}) {
  const headingId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = ref.current!,
      previous = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      className="plan-prompt"
      ref={ref}
      aria-labelledby={headingId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <h2 id={headingId}>{title}</h2>
      <div>{children}</div>
      <footer className="product-actions">{actions}</footer>
    </dialog>
  );
}
