type RateLimitPolicy = {
  key: string;
  limit: number;
  windowSeconds: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfter: number;
  resetAt: number;
};

type MemoryEntry = {
  count: number;
  expiresAt: number;
};

type KvResult = {
  result: number;
};

const memoryStore = globalThis as typeof globalThis & {
  __iconicRateLimitStore?: Map<string, MemoryEntry>;
};

function getMemoryStore() {
  if (!memoryStore.__iconicRateLimitStore) {
    memoryStore.__iconicRateLimitStore = new Map<string, MemoryEntry>();
  }

  return memoryStore.__iconicRateLimitStore;
}

function getBucketKey(baseKey: string, windowSeconds: number) {
  const now = Date.now();
  const windowStart = Math.floor(now / (windowSeconds * 1000));
  const resetAt = (windowStart + 1) * windowSeconds * 1000;

  return {
    storageKey: `${baseKey}:${windowStart}`,
    resetAt,
  };
}

async function incrementInMemory(policy: RateLimitPolicy) {
  const store = getMemoryStore();
  const { storageKey, resetAt } = getBucketKey(policy.key, policy.windowSeconds);
  const now = Date.now();
  const entry = store.get(storageKey);

  if (!entry || entry.expiresAt <= now) {
    store.set(storageKey, {
      count: 1,
      expiresAt: resetAt,
    });

    return {
      count: 1,
      resetAt,
    };
  }

  entry.count += 1;
  store.set(storageKey, entry);

  return {
    count: entry.count,
    resetAt: entry.expiresAt,
  };
}

async function callKv(path: string) {
  const baseUrl = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!baseUrl || !token) {
    return null;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`KV rate limit request failed: ${response.status}`);
  }

  return (await response.json()) as KvResult;
}

async function incrementInKv(policy: RateLimitPolicy) {
  const { storageKey, resetAt } = getBucketKey(policy.key, policy.windowSeconds);
  const encodedKey = encodeURIComponent(storageKey);
  const incrementResult = await callKv(`/incr/${encodedKey}`);

  if (!incrementResult) {
    return null;
  }

  if (incrementResult.result === 1) {
    await callKv(`/expire/${encodedKey}/${policy.windowSeconds}`);
  }

  return {
    count: incrementResult.result,
    resetAt,
  };
}

export async function consumeRateLimit(policy: RateLimitPolicy): Promise<RateLimitResult> {
  const kvResult = await incrementInKv(policy).catch((error) => {
    console.warn('[rate-limit] KV unavailable, falling back to in-memory store:', error);
    return null;
  });
  const result = kvResult || (await incrementInMemory(policy));
  const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
  const remaining = Math.max(0, policy.limit - result.count);

  return {
    allowed: result.count <= policy.limit,
    limit: policy.limit,
    remaining,
    retryAfter,
    resetAt: Math.floor(result.resetAt / 1000),
  };
}
