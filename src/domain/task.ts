/**
 * A single todo item.
 *
 * `dueDate` is an ISO calendar date (`YYYY-MM-DD`) so it round-trips through
 * `<input type="date">` and JSON without timezone drift. `createdAt` is a full
 * ISO-8601 timestamp.
 */
export interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

/** Fields a caller supplies when creating a task; the rest are generated. */
export interface NewTaskInput {
  title: string;
  dueDate: string;
}

/** Matches an ISO calendar date and rejects anything else. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/** Narrows an unknown value (e.g. parsed JSON) to a well-formed Task. */
export function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    t.id.length > 0 &&
    typeof t.title === 'string' &&
    isIsoDate(t.dueDate) &&
    typeof t.completed === 'boolean' &&
    typeof t.createdAt === 'string'
  );
}

export function createTask(input: NewTaskInput): Task {
  return {
    id: generateId(),
    title: input.title,
    dueDate: input.dueDate,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

/** Unique enough for a single-browser app, without pulling in a uuid dependency. */
export function generateId(): string {
  const globalCrypto = globalThis.crypto;
  if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
    return globalCrypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
