/**
 * A single todo item.
 *
 * `dueDate` is a local date and time (`YYYY-MM-DDTHH:mm`) so it round-trips
 * through `<input type="datetime-local">` and JSON without timezone drift: the
 * wall-clock time the user picked is the one shown back. `createdAt` is a full
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

/** Matches a local date and time to the minute, e.g. `2026-01-15T09:30`. */
const ISO_DATE_TIME = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/;

export function isIsoDateTime(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = ISO_DATE_TIME.exec(value);
  if (!match) return false;
  const [, date, hours, minutes] = match;
  return isIsoDate(date) && Number(hours) < 24 && Number(minutes) < 60;
}

/**
 * The time given to a due date saved before due dates carried one: the end of
 * that day, so the task still reads as due "that day" and sorts after anything
 * given an explicit time on the same date.
 */
export const END_OF_DAY = '23:59';

/** Upgrades a date-only due date to a date and time; anything else is unchanged. */
export function withDueTime(value: unknown): unknown {
  return isIsoDate(value) ? `${value}T${END_OF_DAY}` : value;
}

/** Narrows an unknown value (e.g. parsed JSON) to a well-formed Task. */
export function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    t.id.length > 0 &&
    typeof t.title === 'string' &&
    isIsoDateTime(t.dueDate) &&
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
