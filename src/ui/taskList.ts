import type { Task } from '../domain/task';

/** Callbacks the list needs to act on a task row. */
export interface TaskListActions {
  onToggleComplete(id: string, completed: boolean): void;
}

/**
 * Renders the sorted tasks into `list`. Titles go in via `textContent`, never
 * `innerHTML`, so a title containing markup is shown as text rather than parsed.
 */
export function renderTaskList(
  list: HTMLUListElement,
  tasks: Task[],
  actions: TaskListActions,
): void {
  list.replaceChildren(...tasks.map((task) => renderTaskItem(task, actions)));
}

function renderTaskItem(task: Task, actions: TaskListActions): HTMLLIElement {
  const item = document.createElement('li');
  item.className = task.completed ? 'task task--completed' : 'task';
  item.dataset.taskId = task.id;

  const label = document.createElement('label');
  label.className = 'task__toggle';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task__checkbox';
  checkbox.checked = task.completed;
  // A native checkbox already announces its checked state and is operable with
  // Space, so the visible label only needs to name which task it refers to.
  checkbox.setAttribute('aria-label', `Mark "${task.title}" as complete`);
  checkbox.addEventListener('change', () => {
    actions.onToggleComplete(task.id, checkbox.checked);
  });

  const title = document.createElement('span');
  title.className = 'task__title';
  title.textContent = task.title;

  label.append(checkbox, title);

  const due = document.createElement('time');
  due.className = 'task__due';
  due.dateTime = task.dueDate;
  due.textContent = formatDueDate(task.dueDate);

  item.append(label, due);
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
