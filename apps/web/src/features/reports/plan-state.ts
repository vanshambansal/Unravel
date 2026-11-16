import type { TestPlan, PlanStep, PlanAssertion } from '@unravel/test-plan';
export type PlanSelection =
  | { kind: 'step'; value: PlanStep; isNew?: boolean }
  | { kind: 'assertion'; value: PlanAssertion; isNew?: boolean }
  | { kind: 'path'; value: string };
export type PlanHistory = { value: TestPlan; past: TestPlan[]; future: TestPlan[] };
export const startHistory = (value: TestPlan): PlanHistory => ({ value, past: [], future: [] });
export function commitHistory(history: PlanHistory, value: TestPlan): PlanHistory {
  if (JSON.stringify(history.value) === JSON.stringify(value)) return history;
  return { value, past: [...history.past, history.value].slice(-25), future: [] };
}
export function undoHistory(history: PlanHistory): PlanHistory {
  const value = history.past.at(-1);
  return value
    ? {
        value,
        past: history.past.slice(0, -1),
        future: [history.value, ...history.future].slice(0, 25),
      }
    : history;
}
export function redoHistory(history: PlanHistory): PlanHistory {
  const value = history.future[0];
  return value
    ? { value, past: [...history.past, history.value].slice(-25), future: history.future.slice(1) }
    : history;
}
export type CachedDraft = {
  plan: TestPlan;
  raw: string;
  baseline: string;
  revision: number;
  mode: 'reproduction' | 'regression';
  selection: PlanSelection | null;
};
// Memory only: no credentials/test values written to localStorage or sessionStorage.
const drafts = new Map<string, CachedDraft>();
export const readDraft = (key: string) => drafts.get(key);
export function rememberDraft(key: string, value: CachedDraft | null) {
  drafts.delete(key);
  if (!value) return;
  drafts.set(key, value);
  if (drafts.size > 4) drafts.delete(drafts.keys().next().value!);
}
