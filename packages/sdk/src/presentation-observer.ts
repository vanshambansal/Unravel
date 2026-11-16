import type { ReplayEvent } from '@unravel/contracts';
import { capturePresentation } from './presentation';
import type { Privacy } from './privacy';

type Mirror = { getId(node: Node): number };
type StyleChange = { id: number; attributes: { style: string } };

/** CSS/WAAPI can change pixels without DOM mutations. Sample only safe presentation,
 * with bounded work; never run captured animation code in the replay document. */
export function observePresentation(
  privacy: Privacy,
  mirror: Mirror,
  emit: (changes: StyleChange[]) => void,
) {
  const styles = new Map<number, string>();
  const roots = new Set<Element>();
  const ancestors = new Set<Element>();
  const walks: TreeWalker[] = [];
  let previousAnimated = new Set<Element>();
  let animationCursor = 0;
  let disposed = false;
  const enqueue = (element: Element | null) => {
    if (element?.isConnected && !privacy.blocked(element) && roots.size < 256) roots.add(element);
  };
  const queueTree = (node: Node) => {
    const element = node instanceof Element ? node : node.parentElement;
    // Firefox may expose pixel dimensions rather than authored "auto" sizing.
    // Revisit ancestors when children grow/shrink, without rescanning each subtree.
    let parent = element?.parentElement;
    for (
      let depth = 0;
      parent && depth < 32 && ancestors.size < 128;
      depth++, parent = parent.parentElement
    )
      if (!privacy.blocked(parent)) ancestors.add(parent);
    if (element?.closest('style,link')) enqueue(document.documentElement);
    else enqueue(element);
  };
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'childList') {
        // Parent layout/inherited styles may change as well as new children.
        enqueue(record.target instanceof Element ? record.target : record.target.parentElement);
        for (const node of record.addedNodes) queueTree(node);
      } else queueTree(record.target);
    }
  });
  observer.observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  });
  const interaction = (event: Event) => {
    if (event.target instanceof Element) enqueue(event.target.parentElement ?? event.target);
  };
  const animation = (event: Event) => {
    if (event.target instanceof Element) enqueue(event.target);
  };
  const resize = () => enqueue(document.documentElement);
  const interactions = ['input', 'change', 'focusin', 'focusout', 'pointerover', 'pointerout'];
  const animationEvents = [
    'animationstart',
    'animationend',
    'animationcancel',
    'transitionrun',
    'transitionend',
    'transitioncancel',
  ];
  for (const name of interactions) document.addEventListener(name, interaction, true);
  for (const name of animationEvents) document.addEventListener(name, animation, true);
  window.addEventListener('resize', resize);
  const media = ['(prefers-reduced-motion: reduce)', '(prefers-color-scheme: dark)'].map((query) =>
    window.matchMedia(query),
  );
  for (const query of media) query.addEventListener('change', resize);
  document.addEventListener('visibilitychange', resize);
  document.addEventListener('load', resize, true);

  function tick() {
    if (disposed || document.visibilityState === 'hidden') return;
    const changes: StyleChange[] = [];
    const sampled = new Set<Element>();
    let remaining = 60;
    const sample = (element: Element) => {
      if (remaining <= 0 || sampled.has(element)) return;
      sampled.add(element);
      remaining--;
      const id = mirror.getId(element);
      if (
        id < 0 ||
        !element.isConnected ||
        privacy.blocked(element) ||
        element.matches('head,script,style,link,meta,title')
      )
        return;
      const style = capturePresentation(element);
      if (style && styles.get(id) !== style) {
        styles.set(id, style);
        changes.push({ id, attributes: { style } });
      }
    };
    const animated = new Set<Element>();
    const animations = document.getAnimations?.() ?? [];
    for (let index = 0; index < Math.min(20, animations.length); index++) {
      const entry = animations[(animationCursor + index) % animations.length];
      const target = (entry.effect as KeyframeEffect | null)?.target;
      if (target instanceof Element && !privacy.blocked(target)) {
        animated.add(target);
        sample(target);
      }
    }
    animationCursor = animations.length ? (animationCursor + 20) % animations.length : 0;
    // Sample the final/restored state even after an animation leaves getAnimations().
    for (const target of previousAnimated) sample(target);
    previousAnimated = animated;
    for (const element of ancestors) {
      if (remaining <= 0) break;
      ancestors.delete(element);
      sample(element);
    }
    for (const root of roots) {
      if (walks.length >= 32 || remaining <= 0) break;
      roots.delete(root);
      sample(root);
      walks.push(
        document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
          acceptNode: (node) =>
            privacy.blocked(node as Element) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
        }),
      );
    }
    while (remaining > 0 && walks.length) {
      const next = walks[0].nextNode();
      if (!next) walks.shift();
      else sample(next as Element);
    }
    // Bound baseline memory across repeated SPA route mounts.
    while (styles.size > 20000) styles.delete(styles.keys().next().value!);
    if (changes.length && !disposed) emit(changes);
  }
  const timer = window.setInterval(tick, 125);
  enqueue(document.documentElement);
  return {
    note(event: ReplayEvent) {
      const data = event.data as Record<string, unknown>;
      const nodes: unknown[] = event.type === 2 ? [data.node] : [];
      if (event.type === 3 && data.source === 0) {
        for (const item of (data.attributes ?? []) as {
          id: number;
          attributes: { style?: string };
        }[])
          if (typeof item.attributes.style === 'string') styles.set(item.id, item.attributes.style);
        for (const item of (data.adds ?? []) as { node: unknown }[]) nodes.push(item.node);
        for (const item of (data.removes ?? []) as { id: number }[]) styles.delete(item.id);
      }
      while (nodes.length) {
        const node = nodes.pop() as {
          id: number;
          attributes?: { style?: string };
          childNodes?: unknown[];
        };
        if (typeof node?.attributes?.style === 'string') styles.set(node.id, node.attributes.style);
        nodes.push(...(node?.childNodes ?? []));
      }
    },
    destroy() {
      disposed = true;
      observer.disconnect();
      clearInterval(timer);
      for (const name of interactions) document.removeEventListener(name, interaction, true);
      for (const name of animationEvents) document.removeEventListener(name, animation, true);
      window.removeEventListener('resize', resize);
      for (const query of media) query.removeEventListener('change', resize);
      document.removeEventListener('visibilitychange', resize);
      document.removeEventListener('load', resize, true);
      styles.clear();
      roots.clear();
      ancestors.clear();
      walks.length = 0;
      previousAnimated.clear();
    },
  };
}
