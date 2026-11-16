import {
  ReportSubmissionSchema,
  sanitizePresentation,
  type ReplayEvent,
  type ReportSubmission,
} from '@unravel/contracts';
import { ApplicationError } from '../errors.ts';

const inertTags = new Set(
  'html head body main header footer section article aside nav div span p h1 h2 h3 h4 h5 h6 form label input textarea select option button ul ol li dl dt dd table thead tbody tr th td details summary dialog br hr pre code strong em small fieldset legend a img'.split(
    ' ',
  ),
);
type Obj = Record<string, unknown>;
const bad = () => {
  throw new ApplicationError(422, 'The recording contains unsupported or malformed replay data.');
};
function object(value: unknown, keys: string[]): Obj {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return bad();
  const result = value as Obj;
  if (Object.keys(result).some((key) => !keys.includes(key))) return bad();
  return result;
}
function num(value: unknown, min = -1e10, max = 1e10): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max)
    return bad();
  return value;
}
function id(value: unknown) {
  const n = num(value, -2);
  if (!Number.isInteger(n)) return bad();
  return n;
}
function list(value: unknown): unknown[] {
  if (!Array.isArray(value) || value.length > 20000) return bad();
  return value;
}
function string(value: unknown, max = 10000): string {
  if (typeof value !== 'string' || value.length > max) return bad();
  return value;
}

// Reconstruct a deliberately inert rrweb subset. Never persist raw unknown replay JSON.
export function validateSubmission(input: unknown): ReportSubmission {
  // Check nesting iteratively before Zod's recursive JSON validation.
  const pending: { value: unknown; depth: number }[] = [{ value: input, depth: 0 }],
    seen = new WeakSet<object>();
  let visited = 0;
  while (pending.length) {
    const item = pending.pop()!;
    if (++visited > 250000 || item.depth > 256) return bad();
    if (item.value && typeof item.value === 'object') {
      if (seen.has(item.value)) return bad();
      seen.add(item.value);
      for (const child of Object.values(item.value))
        pending.push({ value: child, depth: item.depth + 1 });
    }
  }
  const parsed = ReportSubmissionSchema.safeParse(input);
  if (!parsed.success)
    throw new ApplicationError(422, 'Check the report details and recording version.');
  const value = parsed.data,
    recording = value.recording;
  value.title = value.title.trim();
  value.description = value.description.trim();
  if (
    !value.title ||
    !recording.hasFullSnapshot ||
    recording.durationMs > 600000 ||
    recording.replay.length + recording.events.length > 20000
  )
    return bad();
  let nodes = 0;
  function attributes(raw: unknown): Obj {
    const data = object(raw, [
      'data-testid',
      'type',
      'value',
      'disabled',
      'checked',
      'selected',
      'multiple',
      'required',
      'open',
      'rr_open_mode',
      'width',
      'height',
      'rows',
      'cols',
      'size',
      'colspan',
      'rowspan',
      'rr_width',
      'rr_height',
      'href',
      'rel',
      'style',
    ]);
    const safe: Obj = {};
    for (const [key, item] of Object.entries(data)) {
      if (key === 'href' || key === 'rel') continue; // No recorded resource loading, even when the SDK allowed a stylesheet.
      if (key === 'style') {
        const style = sanitizePresentation(item);
        if (recording.presentation !== 1 || style === null) return bad();
        safe.style = style;
      } else if (key === 'open') {
        if (item !== null && item !== '' && typeof item !== 'boolean') return bad();
        safe[key] = item === true ? '' : item === false ? null : item;
      } else if (['disabled', 'checked', 'selected', 'multiple', 'required'].includes(key)) {
        if (item !== null && typeof item !== 'boolean') return bad();
        safe[key] = item;
      } else if (key === 'rr_open_mode') {
        if (item !== 'modal' && item !== 'non-modal') return bad();
        safe[key] = item;
      } else if (key === 'type') {
        if (
          typeof item !== 'string' ||
          !/^(text|email|number|checkbox|radio|button|submit|reset|search|tel|url|date|time|range|color|password|hidden)$/.test(
            item,
          )
        )
          return bad();
        safe[key] = item;
      } else if (['rr_width', 'rr_height'].includes(key)) {
        if (typeof item !== 'string' || !/^\d+(\.\d+)?px$/.test(item)) return bad();
        safe[key] = item;
      } else if (['width', 'height', 'rows', 'cols', 'size', 'colspan', 'rowspan'].includes(key)) {
        if (typeof item !== 'string' || !/^\d{1,5}$/.test(item)) return bad();
        safe[key] = item;
      } else safe[key] = string(item, key === 'data-testid' ? 120 : 10000);
    }
    return safe;
  }
  function node(raw: unknown, depth = 0): Obj {
    if (++nodes > 50000 || depth > 100) return bad();
    const data = object(raw, [
      'id',
      'type',
      'childNodes',
      'name',
      'publicId',
      'systemId',
      'textContent',
      'tagName',
      'attributes',
      'isShadow',
    ]);
    const nodeId = id(data.id),
      type = id(data.type);
    if (data.isShadow) return bad(); // Unsupported initial replay boundary, not silently successful capture.
    if (type === 0)
      return {
        id: nodeId,
        type,
        childNodes: list(data.childNodes).map((child) => node(child, depth + 1)),
      };
    if (type === 1) return { id: nodeId, type, name: 'html', publicId: '', systemId: '' };
    if ([3, 4, 5].includes(type))
      return { id: nodeId, type, textContent: type === 3 ? string(data.textContent) : '' };
    if (type !== 2) return bad();
    const tag = string(data.tagName, 32);
    if (
      ['script', 'iframe', 'object', 'embed', 'svg', 'canvas', 'video', 'audio', 'base'].includes(
        tag,
      )
    )
      return bad();
    const attrs = attributes(data.attributes);
    if (attrs.type === 'hidden' || (attrs.type === 'password' && recording.captureMode !== 'full'))
      delete attrs.value;
    return {
      id: nodeId,
      type: 2,
      tagName: inertTags.has(tag) ? tag : 'div',
      attributes: attrs,
      childNodes: list(data.childNodes).map((child) => node(child, depth + 1)),
    };
  }
  let snapshots = 0,
    previous = 0;
  recording.replay = recording.replay.map((event) => {
    if (
      event.timestamp < previous ||
      Math.abs(event.timestamp - recording.startedAt) > recording.durationMs + 2000
    )
      return bad();
    previous = event.timestamp;
    const data = event.data;
    let clean: Obj;
    if (event.type === 0 || event.type === 1) {
      object(data, []);
      clean = {};
    } else if (event.type === 4) {
      const d = object(data, ['href', 'width', 'height']);
      clean = {
        href: recording.initialUrl.origin + '/',
        width: num(d.width, 1, 16384),
        height: num(d.height, 1, 16384),
      };
    } else if (event.type === 2) {
      const d = object(data, ['node', 'initialOffset']),
        offset = object(d.initialOffset, ['top', 'left']),
        root = node(d.node);
      if (
        root.type !== 0 ||
        !Array.isArray(root.childNodes) ||
        !root.childNodes.some((child) => (child as Obj).tagName === 'html')
      )
        return bad();
      clean = { node: root, initialOffset: { top: num(offset.top), left: num(offset.left) } };
      snapshots++;
    } else if (event.type === 3) {
      const d = object(data, [
        'source',
        'texts',
        'attributes',
        'removes',
        'adds',
        'id',
        'text',
        'isChecked',
        'type',
        'x',
        'y',
        'positions',
        'width',
        'height',
      ]);
      const source = id(d.source);
      clean = { source };
      if (source === 0)
        Object.assign(clean, {
          texts: list(d.texts).map((raw) => {
            const item = object(raw, ['id', 'value']);
            return { id: id(item.id), value: string(item.value) };
          }),
          attributes: list(d.attributes).map((raw) => {
            const item = object(raw, ['id', 'attributes']);
            return { id: id(item.id), attributes: attributes(item.attributes) };
          }),
          removes: list(d.removes).map((raw) => {
            const item = object(raw, ['id', 'parentId']);
            return { id: id(item.id), parentId: id(item.parentId) };
          }),
          adds: list(d.adds).map((raw) => {
            const item = object(raw, ['parentId', 'nextId', 'node']);
            return {
              parentId: id(item.parentId),
              nextId: item.nextId === null ? null : id(item.nextId),
              node: node(item.node),
            };
          }),
        });
      else if (source === 5) {
        if (typeof d.isChecked !== 'boolean') return bad();
        Object.assign(clean, { id: id(d.id), text: string(d.text), isChecked: d.isChecked });
      } else if (source === 2)
        Object.assign(clean, { id: id(d.id), type: num(d.type, 0, 20), x: num(d.x), y: num(d.y) });
      else if ([1, 6, 12].includes(source))
        clean.positions = list(d.positions).map((raw) => {
          const item = object(raw, ['id', 'x', 'y', 'timeOffset']);
          return {
            id: id(item.id),
            x: num(item.x),
            y: num(item.y),
            timeOffset: num(item.timeOffset, -600000, 600000),
          };
        });
      else if (source === 3) Object.assign(clean, { id: id(d.id), x: num(d.x), y: num(d.y) });
      else if (source === 4)
        Object.assign(clean, { width: num(d.width, 1, 16384), height: num(d.height, 1, 16384) });
      else return bad();
    } else return bad();
    return { type: event.type, timestamp: event.timestamp, data: clean } as ReplayEvent;
  });
  if (!snapshots || recording.events.some((event) => event.at > recording.durationMs + 2000))
    return bad();
  return value;
}
