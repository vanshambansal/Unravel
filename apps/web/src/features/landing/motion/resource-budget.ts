type ResourceHints = { saveData?: boolean; effectiveType?: string; deviceMemory?: number; hardwareConcurrency?: number };

/** Conservative hints, not a device score. Nothing is transmitted or persisted. */
export function conserveSceneResources(hints: ResourceHints): boolean {
  if (hints.saveData || ['slow-2g', '2g'].includes(hints.effectiveType ?? '')) return true;
  const { deviceMemory: memory, hardwareConcurrency: cores } = hints;
  return typeof memory === 'number' && memory > 0 && memory <= 2 && typeof cores === 'number' && cores > 0 && cores <= 2;
}
