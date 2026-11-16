export interface PlanResponse {
  plan: unknown;
  generated?: unknown;
  revision: number;
  targetOrigin?: string;
}

/** One mounted report only. Share an anticipated read with the tab, never storage. */
export function createPlanLoader(endpoint: string) {
  type Pending = { controller: AbortController; promise: Promise<PlanResponse>; at: number };
  let request: Pending | undefined;
  function clear() {
    request?.controller.abort();
    request = undefined;
  }
  function read(fresh = false): Promise<PlanResponse> {
    if (fresh || (request && performance.now() - request.at > 10_000)) clear();
    if (request) return request.promise;
    const controller = new AbortController();
    const entry: Pending = {
      controller,
      at: performance.now(),
      promise: fetch(endpoint, { cache: 'no-store', signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error('Plan read failed');
          return (await response.json()) as PlanResponse;
        })
        .catch((error) => {
          if (request === entry) request = undefined;
          throw error;
        }),
    };
    request = entry;
    return entry.promise;
  }
  return {
    read,
    prepare: () => {
      void read().catch(() => {});
    },
    clear,
  };
}
