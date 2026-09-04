import type { Task } from '../domain/task';

/**
 * Renders the sorted tasks into `list`. Titles go in via `textContent`, never
 * `innerHTML`, so a title containing markup is shown as text rather than parsed.
 */
export function renderTaskList(list: HTMLUListElement, tasks: Task[]): void {
  list.replaceChildren(...tasks.map(renderTaskItem));
}

function renderTaskItem(task: Task): HTMLLIElement {
  const item = document.createElement('li');
  item.className = 'task';
  item.dataset.taskId = task.id;

  const title = document.createElement('span');
  title.className = 'task__title';
  title.textContent = task.title;

  const due = document.createElement('time');
  due.className = 'task__due';
  due.dateTime = task.dueDate;
  due.textContent = formatDueDate(task.dueDate);

  item.append(title, due);
  return item;
}

/** Renders an ISO date as e.g. "15 Jan 2026", falling back to the raw value. */
export function formatDueDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
