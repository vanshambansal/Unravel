export type ReportStatus = 'open' | 'resolved';
export type ReportQuery = { q: string; status: 'all' | ReportStatus; page: number };
export const REPORT_PAGE_SIZE = 20;
export function reportQuery(input: Record<string, unknown>): ReportQuery {
  if (
    (input.q !== undefined && typeof input.q !== 'string') ||
    (input.status !== undefined && typeof input.status !== 'string') ||
    (input.page !== undefined && !['string', 'number'].includes(typeof input.page))
  )
    throw new Error('Provide one search, status and page value.');
  const q = typeof input.q === 'string' ? input.q.trim() : '';
  const status = input.status ?? 'all',
    page = Number(input.page ?? 1);
  if (
    q.length > 200 ||
    !['all', 'open', 'resolved'].includes(String(status)) ||
    !Number.isInteger(page) ||
    page < 1 ||
    page > 100000
  )
    throw new Error(
      'Use a search up to 200 characters, a valid status and a positive page number.',
    );
  return { q, status: status as ReportQuery['status'], page };
}
export function reportChanges(input: unknown) {
  const data = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const description = typeof data.description === 'string' ? data.description.trim() : '';
  if (
    !title ||
    title.length > 120 ||
    typeof data.description !== 'string' ||
    description.length > 2000 ||
    !['open', 'resolved'].includes(String(data.status)) ||
    !Number.isInteger(data.revision) ||
    Number(data.revision) < 1 ||
    Number(data.revision) > 1e9 ||
    Object.keys(data).some((key) => !['title', 'description', 'status', 'revision'].includes(key))
  )
    throw new Error(
      'Provide a title (1–120 characters), description (up to 2,000), status and current revision.',
    );
  return {
    title,
    description,
    status: data.status as ReportStatus,
    revision: Number(data.revision),
  };
}
export function reportSearch(query: ReportQuery, page = query.page) {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.status !== 'all') params.set('status', query.status);
  if (page > 1) params.set('page', String(page));
  return params.toString() ? `?${params}` : '';
}
