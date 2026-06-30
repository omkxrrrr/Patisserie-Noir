/**
 * src/api/cache.js
 * In-memory request cache, keyed by action+params, with a TTL. This is
 * the second layer of caching (the first is server-side, in the Apps
 * Script CacheService). Together they mean a page like the catalog,
 * visited by many people within the same minute, triggers at most one
 * real Sheets read instead of one per visitor.
 */

const store = new Map();
const inflight = new Map();

function keyFor(action, params) {
  return `${action}::${JSON.stringify(params, Object.keys(params).sort())}`;
}

/**
 * Wrap any async fetcher with caching + request de-duplication.
 * @param {string} action
 * @param {object} params
 * @param {() => Promise<any>} fetcher
 * @param {number} ttlMs
 */
export async function withCache(action, params, fetcher, ttlMs = 60_000) {
  const key = keyFor(action, params);
  const cached = store.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }
  if (inflight.has(key)) {
    return inflight.get(key);
  }
  const promise = fetcher()
    .then((value) => {
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
      inflight.delete(key);
      return value;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });
  inflight.set(key, promise);
  return promise;
}

/** Call after any mutation so the next read isn't served stale cached data. */
export function invalidate(actionPrefix) {
  for (const key of store.keys()) {
    if (key.startsWith(actionPrefix)) store.delete(key);
  }
}

export function clearAllCache() {
  store.clear();
}
