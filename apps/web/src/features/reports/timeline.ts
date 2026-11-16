import type { SemanticEvent } from '@unravel/contracts';
export function timelineEntries(events: SemanticEvent[], raw = false) {
  const result: { event: SemanticEvent; index: number; indices: number[]; startAt: number }[] = [];
  for (const { event, index } of events
    .map((event, index) => ({ event, index }))
    .sort((a, b) => a.event.at - b.event.at)) {
    const prior = result.at(-1);
    if (
      !raw &&
      prior &&
      event.kind === 'action' &&
      event.action === 'fill' &&
      event.target.kind !== 'unresolved' &&
      prior.event.kind === 'action' &&
      prior.event.action === 'fill' &&
      JSON.stringify(prior.event.target) === JSON.stringify(event.target) &&
      event.at - prior.event.at <= 1500
    ) {
      prior.event = event;
      prior.index = index;
      prior.indices.push(index);
    } else result.push({ event, index, indices: [index], startAt: event.at });
  }
  return result;
}
