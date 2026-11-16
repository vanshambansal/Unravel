const connectionCodes = new Set([
  'ENOTFOUND',
  'EAI_AGAIN',
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EACCES',
]);

/** Never log driver messages/queries/URLs: inspect only bounded error codes. */
export function storageFailureKind(error: unknown): string {
  const pending: unknown[] = [error],
    seen = new Set<unknown>();
  for (let i = 0; i < 16 && pending.length; i++) {
    const value = pending.shift();
    if (!value || typeof value !== 'object' || seen.has(value)) continue;
    seen.add(value);
    const item = value as { code?: unknown; cause?: unknown; errors?: unknown };
    if (
      typeof item.code === 'string' &&
      (connectionCodes.has(item.code) || /^[0-9A-Z]{5}$/.test(item.code))
    )
      return item.code;
    pending.push(item.cause);
    if (Array.isArray(item.errors)) pending.push(...item.errors.slice(0, 4));
  }
  return error instanceof TypeError ? 'TypeError' : 'unknown';
}
