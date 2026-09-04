import type { StorageLike } from './taskStorage';

/** A `StorageLike` that keeps values for the session only. */
export class MemoryStorage implements StorageLike {
  private readonly map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }
}

const PROBE_KEY = 'i2l-todo:probe';

/**
 * Returns `localStorage` when it is genuinely usable, and an in-memory stand-in
 * otherwise. Merely reading `window.localStorage` can throw when cookies are
 * blocked, and Safari private mode accepts the property but throws on write —
 * so the only reliable check is an actual write/remove round-trip.
 */
export function resolveStorage(): { storage: StorageLike; persistent: boolean } {
  try {
    const candidate = globalThis.localStorage;
    if (!candidate) return { storage: new MemoryStorage(), persistent: false };

    candidate.setItem(PROBE_KEY, '1');
    candidate.removeItem(PROBE_KEY);
    return { storage: candidate, persistent: true };
  } catch {
    return { storage: new MemoryStorage(), persistent: false };
  }
}
