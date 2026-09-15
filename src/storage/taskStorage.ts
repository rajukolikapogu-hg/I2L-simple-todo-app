import { isTask, withDueTime, type Task } from '../domain/task';

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

  /**
   * Reads the persisted tasks, keeping only entries that match the Task shape.
   *
   * Storage is user-editable and survives across app versions, so anything can
   * be in there. Missing, unreadable, unparseable and structurally wrong
   * payloads all resolve to an empty collection rather than an exception —
   * startup must never fail because of what is (or isn't) in storage.
   */
  load(): Task[] {
    let raw: string | null;
    try {
      raw = this.storage.getItem(STORAGE_KEY);
    } catch {
      return [];
    }
    if (raw === null) return [];

    try {
      return extractTasks(JSON.parse(raw) as unknown);
    } catch {
      return [];
    }
  }

  /**
   * Writes the full collection; called on every mutation. A failed write (quota
   * exceeded, storage disabled mid-session) leaves the in-memory collection
   * intact so the app stays usable, and reports it via the return value.
   */
  save(tasks: Task[]): boolean {
    const state: StoredState = { version: STORAGE_VERSION, tasks };
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Pulls the task array out of a parsed payload, dropping malformed entries.
 *
 * Tasks saved before due dates carried a time hold a bare `YYYY-MM-DD`; they are
 * upgraded to the end of that day rather than dropped, and the next save writes
 * them back in the new shape.
 */
export function extractTasks(parsed: unknown): Task[] {
  if (typeof parsed !== 'object' || parsed === null) return [];
  const tasks = (parsed as { tasks?: unknown }).tasks;
  if (!Array.isArray(tasks)) return [];
  return tasks.map(upgradeDueDate).filter(isTask);
}

function upgradeDueDate(entry: unknown): unknown {
  if (typeof entry !== 'object' || entry === null) return entry;
  const dueDate = (entry as { dueDate?: unknown }).dueDate;
  const upgraded = withDueTime(dueDate);
  return upgraded === dueDate ? entry : { ...entry, dueDate: upgraded };
}
