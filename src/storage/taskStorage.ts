import { isTask, type Task } from '../domain/task';

/**
 * Everything the app persists lives under this one versioned key, so a future
 * schema change can migrate (or discard) the whole payload in one place.
 */
export const STORAGE_KEY = 'i2l-todo:v1';

/** The shape written to localStorage under {@link STORAGE_KEY}. */
export interface StoredState {
  version: 1;
  tasks: Task[];
}

export const STORAGE_VERSION = 1 as const;

/**
 * The slice of the Web Storage API the app actually uses, so tests can pass a
 * stub and the app can swap in an in-memory fallback.
 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class TaskStorage {
  constructor(private readonly storage: StorageLike) {}

  /** Reads the persisted tasks, keeping only entries that match the Task shape. */
  load(): Task[] {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (raw === null) return [];

    const parsed: unknown = JSON.parse(raw);
    return extractTasks(parsed);
  }

  /** Writes the full collection; called on every mutation. */
  save(tasks: Task[]): void {
    const state: StoredState = { version: STORAGE_VERSION, tasks };
    this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

/** Pulls the task array out of a parsed payload, dropping malformed entries. */
export function extractTasks(parsed: unknown): Task[] {
  if (typeof parsed !== 'object' || parsed === null) return [];
  const tasks = (parsed as { tasks?: unknown }).tasks;
  if (!Array.isArray(tasks)) return [];
  return tasks.filter(isTask);
}
