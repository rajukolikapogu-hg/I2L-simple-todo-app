import type { NewTaskInput } from '../domain/task';

export interface TaskFormHandle {
  element: HTMLFormElement;
  /** Returns focus to the title field, e.g. after a successful creation. */
  focus(): void;
  /** Clears the fields back to their initial state. */
  reset(): void;
}

/**
 * The "add a task" form. Submitting hands a title and due date to `onSubmit`.
 * Clearing and refocusing is left to the caller via `reset()` / `focus()`,
 * because only the caller knows whether the task was actually accepted.
 */
export function createTaskForm(onSubmit: (input: NewTaskInput) => void): TaskFormHandle {
  const form = document.createElement('form');
  form.className = 'task-form';
  form.noValidate = true;

  const titleField = document.createElement('div');
  titleField.className = 'field field--title';
  const titleLabel = document.createElement('label');
  titleLabel.htmlFor = 'task-title';
  titleLabel.textContent = 'Task';
  const title = document.createElement('input');
  title.id = 'task-title';
  title.name = 'title';
  title.type = 'text';
  title.placeholder = 'What needs doing?';
  title.autocomplete = 'off';
  titleField.append(titleLabel, title);

  const dateField = document.createElement('div');
  dateField.className = 'field field--date';
  const dateLabel = document.createElement('label');
  dateLabel.htmlFor = 'task-due-date';
  dateLabel.textContent = 'Due date';
  const dueDate = document.createElement('input');
  dueDate.id = 'task-due-date';
  dueDate.name = 'dueDate';
  dueDate.type = 'date';
  dueDate.value = today();
  dateField.append(dateLabel, dueDate);

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'button button--primary';
  submit.textContent = 'Add task';

  form.append(titleField, dateField, submit);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onSubmit({ title: title.value.trim(), dueDate: dueDate.value });
  });

  return {
    element: form,
    focus: () => title.focus(),
    reset: () => {
      title.value = '';
      dueDate.value = today();
    },
  };
}

/** Today as an ISO calendar date, used as the default due date. */
export function today(now: Date = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}
