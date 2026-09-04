import { describe, expect, it } from 'vitest';
import { STORAGE_KEY, TaskStorage } from '../src/storage/taskStorage';
import { TaskStore } from '../src/domain/taskStore';
import { MemoryStorage } from '../src/storage/safeStorage';

describe('TaskStorage', () => {
  it('round-trips tasks through storage', () => {
    const backing = new MemoryStorage();
    const storage = new TaskStorage(backing);
    const store = new TaskStore(storage);

    store.add({ title: 'Buy milk', dueDate: '2026-01-15' });
    store.add({ title: 'Call the bank', dueDate: '2026-01-10' });

    // A fresh store reading the same backing storage sees both tasks: this is
    // what happens when the tab is closed and reopened.
    const rehydrated = new TaskStore(new TaskStorage(backing));

    expect(rehydrated.getTasks().map((t) => t.title)).toEqual([
      'Buy milk',
      'Call the bank',
    ]);
  });

  it('writes under a single versioned key', () => {
    const backing = new MemoryStorage();
    const store = new TaskStore(new TaskStorage(backing));

    store.add({ title: 'Ship it', dueDate: '2026-02-01' });

    const raw = backing.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).version).toBe(1);
  });

  it('persists every mutation immediately', () => {
    const backing = new MemoryStorage();
    const store = new TaskStore(new TaskStorage(backing));
    const read = () => JSON.parse(backing.getItem(STORAGE_KEY) as string).tasks;

    const task = store.add({ title: 'Draft the plan', dueDate: '2026-03-01' });
    expect(read()).toHaveLength(1);

    store.update(task.id, { completed: true });
    expect(read()[0].completed).toBe(true);

    store.remove(task.id);
    expect(read()).toHaveLength(0);
  });

  it('notifies subscribers on every change', () => {
    const store = new TaskStore(new TaskStorage(new MemoryStorage()));
    const seen: number[] = [];
    store.subscribe((tasks) => seen.push(tasks.length));

    const task = store.add({ title: 'A', dueDate: '2026-01-01' });
    store.remove(task.id);

    expect(seen).toEqual([1, 0]);
  });
});
