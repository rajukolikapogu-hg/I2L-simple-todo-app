import type { Task } from '../domain/task';

/** Callbacks the list needs to act on a task row. */
export interface TaskListActions {
  onToggleComplete(id: string, completed: boolean): void;
  onDelete(id: string): void;
  /** Returns false when the date was rejected, so the row can keep the editor open. */
  onEditDueDate(id: string, dueDate: string): boolean;
}

export const INVALID_DUE_DATE_MESSAGE = 'Please choose a valid due date and time.';

export const EMPTY_STATE_MESSAGE = 'Nothing to do yet — add your first task above.';

/**
 * Renders the sorted tasks into `list`. Titles go in via `textContent`, never
 * `innerHTML`, so a title containing markup is shown as text rather than parsed.
 *
 * With no tasks the list is replaced by a friendly empty state rather than being
 * left as a blank gap.
 */
export function renderTaskList(
  list: HTMLUListElement,
  tasks: Task[],
  actions: TaskListActions,
): void {
  if (tasks.length === 0) {
    list.replaceChildren(renderEmptyState());
    return;
  }
  list.replaceChildren(...tasks.map((task) => renderTaskItem(task, actions)));
}

function renderEmptyState(): HTMLLIElement {
  const item = document.createElement('li');
  item.className = 'task-list__empty';
  item.textContent = EMPTY_STATE_MESSAGE;
  return item;
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

  item.append(
    label,
    buildDueDateControl(task, actions),
    buildDeleteControl(task, actions),
  );
  return item;
}

/**
 * The task's due date and time, which swaps in place for a date-and-time input
 * when edited.
 *
 * The input is pre-filled with the current value, and a rejected date leaves
 * both the editor open and the stored value untouched, so nothing is lost when
 * a user clears the field or types something the browser cannot parse.
 */
function buildDueDateControl(task: Task, actions: TaskListActions): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'task__due-control';

  const display = document.createElement('div');
  display.className = 'task__due-display';

  const due = document.createElement('time');
  due.className = 'task__due';
  due.dateTime = task.dueDate;
  due.textContent = formatDueDate(task.dueDate);

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'button button--ghost task__edit-due';
  editButton.textContent = 'Edit date';
  editButton.setAttribute('aria-label', `Edit due date for "${task.title}"`);

  display.append(due, editButton);

  const editor = document.createElement('div');
  editor.className = 'task__due-editor';
  editor.hidden = true;

  const input = document.createElement('input');
  input.type = 'datetime-local';
  input.className = 'task__due-input';
  input.id = `task-due-${task.id}`;
  input.setAttribute('aria-label', `Due date for "${task.title}"`);

  const save = document.createElement('button');
  save.type = 'button';
  save.className = 'button button--primary task__save-due';
  save.textContent = 'Save';
  save.setAttribute('aria-label', `Save due date for "${task.title}"`);

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'button button--ghost task__cancel-due';
  cancel.textContent = 'Cancel';
  cancel.setAttribute('aria-label', `Cancel editing due date for "${task.title}"`);

  const error = document.createElement('p');
  error.className = 'task__due-error field__error';
  error.id = `task-due-${task.id}-error`;
  error.setAttribute('role', 'alert');
  error.hidden = true;

  editor.append(input, save, cancel, error);
  wrapper.append(display, editor);

  const setError = (message: string | undefined): void => {
    if (message) {
      error.textContent = message;
      error.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', error.id);
    } else {
      error.textContent = '';
      error.hidden = true;
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  };

  const openEditor = (): void => {
    // Always re-seed from the task, so re-opening after a cancel shows the
    // stored value rather than the abandoned edit.
    input.value = task.dueDate;
    setError(undefined);
    display.hidden = true;
    editor.hidden = false;
    input.focus();
  };

  const closeEditor = (): void => {
    setError(undefined);
    editor.hidden = true;
    display.hidden = false;
    editButton.focus();
  };

  editButton.addEventListener('click', openEditor);
  cancel.addEventListener('click', closeEditor);
  save.addEventListener('click', () => {
    // A rejected date keeps the editor open with the message, so the user can
    // correct it; the accepted case re-renders the whole list from the store.
    if (!actions.onEditDueDate(task.id, input.value)) {
      setError(INVALID_DUE_DATE_MESSAGE);
      input.focus();
    }
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      save.click();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeEditor();
    }
  });

  return wrapper;
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

/**
 * Renders a local date and time as e.g. "15 Jan 2026, 9:30 am" in the viewer's
 * locale, falling back to the raw value.
 */
export function formatDueDate(isoDateTime: string): string {
  // With no offset, a date-time string is parsed as local time, which is what
  // the user picked.
  const parsed = new Date(isoDateTime);
  if (Number.isNaN(parsed.getTime())) return isoDateTime;
  return parsed.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
