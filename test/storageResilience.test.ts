import { describe, expect, it } from 'vitest';
import { STORAGE_KEY, TaskStorage, type StorageLike } from '../src/storage/taskStorage';
import { TaskStore } from '../src/domain/taskStore';
import { MemoryStorage, resolveStorage } from '../src/storage/safeStorage';

/** Storage that throws on every operation, like a browser with storage disabled. */
class ThrowingStorage implements StorageLike {
  getItem(): string | null {
    throw new Error('storage unavailable');
  }
  setItem(): void {
    throw new Error('storage unavailable');
  }
  removeItem(): void {
    throw new Error('storage unavailable');
  }
}

function seeded(raw: string): MemoryStorage {
  const storage = new MemoryStorage();
  storage.setItem(STORAGE_KEY, raw);
  return storage;
}

describe('resilient hydration', () => {
  it('loads empty when storage holds nothing', () => {
    expect(new TaskStorage(new MemoryStorage()).load()).toEqual([]);
  });

  it.each([
    ['unparseable JSON', '{not json at all'],
    ['a JSON primitive', '"hello"'],
    ['null', 'null'],
    ['an array instead of the state object', '[1, 2, 3]'],
    ['a state object with no tasks array', '{"version":1}'],
    ['a tasks field that is not an array', '{"version":1,"tasks":"nope"}'],
  ])('loads empty when storage holds %s', (_label, raw) => {
    expect(new TaskStorage(seeded(raw)).load()).toEqual([]);
  });

  it('drops malformed entries but keeps the well-formed ones', () => {
    const valid = {
      id: 'a1',
      title: 'Real task',
      dueDate: '2026-01-15',
      completed: false,
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    const storage = seeded(
      JSON.stringify({
        version: 1,
        tasks: [valid, { id: 'b2' }, null, 'nope', { ...valid, dueDate: 'yesterday' }],
      }),
    );

    expect(new TaskStorage(storage).load()).toEqual([valid]);
  });

  it('stays usable after loading from an invalid state', () => {
    const store = new TaskStore(new TaskStorage(seeded('{{{')));

    expect(store.getTasks()).toEqual([]);
    store.add({ title: 'Still works', dueDate: '2026-04-01' });
    expect(store.getTasks()).toHaveLength(1);
  });
});

describe('unavailable storage', () => {
  it('does not throw when reading or writing throws', () => {
    const storage = new TaskStorage(new ThrowingStorage());

    expect(storage.load()).toEqual([]);
    expect(storage.save([])).toBe(false);
  });

  it('keeps the app fully usable with no working storage', () => {
    const store = new TaskStore(new TaskStorage(new ThrowingStorage()));

    const task = store.add({ title: 'In-memory only', dueDate: '2026-05-01' });
    store.update(task.id, { completed: true });

    expect(store.getTasks()[0]?.completed).toBe(true);
    store.remove(task.id);
    expect(store.getTasks()).toEqual([]);
  });

  it('resolveStorage reports real localStorage as persistent in a browser env', () => {
    const { persistent } = resolveStorage();
    expect(persistent).toBe(true);
  });
});
