import { ReplayEventSchema, type ReplayEvent } from '@unravel/contracts';
import { EventType, IncrementalSource } from '@rrweb/types';
import type { Privacy } from './privacy';
type ObjectValue = Record<string, unknown>;
const object = (value: unknown): ObjectValue => value && typeof value === 'object' && !Array.isArray(value) ? value as ObjectValue : {};
const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : 0;

export function createReplaySanitizer(privacy: Privacy, getNode: (id: number) => Node | null) {
  function node(raw: unknown, depth = 0): unknown {
    const source = object(raw), id = number(source.id), type = number(source.type);
    const dom = getNode(id);
    if (depth > 100) return { id, type: 2, tagName: 'div', attributes: {}, childNodes: [] };
    if (type === 0) return { id, type, childNodes: array(source.childNodes).map(child => node(child, depth + 1)) };
    if (type === 1) return { id, type, name: 'html', publicId: '', systemId: '' };
    if (type === 3 || type === 4 || type === 5) return { id, type, textContent: type === 3 ? privacy.text(dom, source.textContent) : '' };
    return { id, type: 2, tagName: privacy.tag(source.tagName), attributes: privacy.attributes(privacy.elementFor(dom), object(source.attributes)), childNodes: array(source.childNodes).map(child => node(child, depth + 1)), ...(source.isShadow === true ? { isShadow: true } : {}) };
  }
  return (raw: unknown): ReplayEvent | null => {
    const event = object(raw), data = object(event.data); let result: unknown;
    const base = { type: number(event.type), timestamp: number(event.timestamp) };
    if (base.type === EventType.DomContentLoaded || base.type === EventType.Load) result = { ...base, data: {} };
    else if (base.type === EventType.Meta) {
      const url = privacy.safeUrl(data.href);
      result = { ...base, data: { href: url ? url.origin + (url.path ?? '/') : location.origin + '/', width: number(data.width), height: number(data.height) } };
    } else if (base.type === EventType.FullSnapshot) {
      const offset = object(data.initialOffset);
      result = { ...base, data: { node: node(data.node), initialOffset: { top: number(offset.top), left: number(offset.left) } } };
    } else if (base.type === EventType.IncrementalSnapshot) {
      const source = number(data.source); let safe: unknown;
      if (source === IncrementalSource.Mutation) safe = {
        source,
        texts: array(data.texts).map(raw => { const item = object(raw), id = number(item.id); return { id, value: privacy.text(getNode(id), item.value) }; }),
        attributes: array(data.attributes).map(raw => { const item = object(raw), id = number(item.id); return { id, attributes: privacy.attributes(privacy.elementFor(getNode(id)), object(item.attributes)) }; }),
        removes: array(data.removes).map(raw => { const item = object(raw); return { id: number(item.id), parentId: number(item.parentId) }; }),
        adds: array(data.adds).map(raw => { const item = object(raw); return { parentId: number(item.parentId), nextId: item.nextId === null ? null : number(item.nextId), node: node(item.node) }; }),
      };
      else if (source === IncrementalSource.Input) { const id = number(data.id), element = privacy.elementFor(getNode(id)); safe = { source, id, text: privacy.value(element, data.text), isChecked: privacy.valueAllowed(element) && data.isChecked === true }; }
      else if (source === IncrementalSource.MouseInteraction) safe = { source, type: number(data.type), id: number(data.id), x: number(data.x), y: number(data.y) };
      else if ([IncrementalSource.MouseMove, IncrementalSource.TouchMove, IncrementalSource.Drag].includes(source)) safe = { source, positions: array(data.positions).map(raw => { const item = object(raw); return { id: number(item.id), x: number(item.x), y: number(item.y), timeOffset: number(item.timeOffset) }; }) };
      else if (source === IncrementalSource.Scroll) safe = { source, id: number(data.id), x: number(data.x), y: number(data.y) };
      else if (source === IncrementalSource.ViewportResize) safe = { source, width: number(data.width), height: number(data.height) };
      else return null; // No CSS bodies, fonts, canvas, plugins, logs or unknown extensions.
      result = { ...base, data: safe };
    } else return null;
    const parsed = ReplayEventSchema.safeParse(result);
    return parsed.success ? parsed.data : null;
  };
}
