import type { Task } from './task';

/**
 * Sorts by due date, soonest first. Ties fall back to creation order and then
 * to id, so the list order is stable across re-renders rather than shuffling
 * when two tasks share a due date.
 */
export function sortByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) =>
      a.dueDate.localeCompare(b.dueDate) ||
      a.createdAt.localeCompare(b.createdAt) ||
      a.id.localeCompare(b.id),
  );
}
