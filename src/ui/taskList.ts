import type { Task } from '../domain/task';

/** Callbacks the list needs to act on a task row. */
export interface TaskListActions {
  onToggleComplete(id: string, completed: boolean): void;
  onDelete(id: string): void;
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

  item.append(label, due, buildDeleteControl(task, actions));
  return item;
}

/**
 * A delete button that turns into an inline confirm/cancel pair on first click.
 *
 * Deliberately not `window.confirm`: a native dialog blocks the whole page, is
 * awkward to style and to test, and cannot be dismissed with the keyboard as
 * predictably as two real buttons. The two-step control is lightweight, stays
 * inside the row, and is fully keyboard operable.
 */
function buildDeleteControl(task: Task, actions: TaskListActions): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'task__actions';

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'button button--ghost task__delete';
  deleteButton.textContent = 'Delete';
  deleteButton.setAttribute('aria-label', `Delete "${task.title}"`);

  const confirmation = document.createElement('div');
  confirmation.className = 'task__confirm';
  confirmation.hidden = true;

  const prompt = document.createElement('span');
  prompt.className = 'task__confirm-text';
  prompt.textContent = 'Delete this task?';

  const confirmButton = document.createElement('button');
  confirmButton.type = 'button';
  confirmButton.className = 'button button--danger task__confirm-delete';
  confirmButton.textContent = 'Delete';
  confirmButton.setAttribute('aria-label', `Confirm deleting "${task.title}"`);

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'button button--ghost task__cancel-delete';
  cancelButton.textContent = 'Cancel';
  cancelButton.setAttribute('aria-label', `Keep "${task.title}"`);

  confirmation.append(prompt, confirmButton, cancelButton);
  wrapper.append(deleteButton, confirmation);

  const showConfirmation = (visible: boolean): void => {
    deleteButton.hidden = visible;
    confirmation.hidden = !visible;
  };

  deleteButton.addEventListener('click', () => {
    showConfirmation(true);
    // Land focus on the confirm button so the prompt is reachable without
    // tabbing back into the row.
    confirmButton.focus();
  });
  cancelButton.addEventListener('click', () => {
    showConfirmation(false);
    deleteButton.focus();
  });
  confirmButton.addEventListener('click', () => actions.onDelete(task.id));

  return wrapper;
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
