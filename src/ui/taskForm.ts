import type { NewTaskInput } from '../domain/task';
import type { ValidationResult } from '../domain/validation';

export interface TaskFormHandle {
  element: HTMLFormElement;
  /** Returns focus to the title field, e.g. after a successful creation. */
  focus(): void;
  /** Clears the fields back to their initial state. */
  reset(): void;
  /** Shows (or, given no errors, clears) validation messages. */
  setErrors(errors: ValidationResult['errors']): void;
}

/**
 * The "add a task" form. Submitting hands a title and due date to `onSubmit`.
 * Clearing and refocusing is left to the caller via `reset()` / `focus()`,
 * because only the caller knows whether the task was actually accepted.
 */
export function createTaskForm(onSubmit: (input: NewTaskInput) => void): TaskFormHandle {
  const form = document.createElement('form');
  form.className = 'task-form';
  // The browser's own bubble would pre-empt our inline messages, and it is not
  // announced consistently by screen readers.
  form.noValidate = true;

  const title = buildField({
    id: 'task-title',
    name: 'title',
    label: 'Task',
    type: 'text',
    className: 'field--title',
  });
  title.input.placeholder = 'What needs doing?';
  title.input.autocomplete = 'off';

  const dueDate = buildField({
    id: 'task-due-date',
    name: 'dueDate',
    label: 'Due date',
    type: 'date',
    className: 'field--date',
  });
  dueDate.input.value = today();

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'button button--primary';
  submit.textContent = 'Add task';

  form.append(title.wrapper, dueDate.wrapper, submit);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onSubmit({ title: title.input.value.trim(), dueDate: dueDate.input.value });
  });

  const fields = { title, dueDate } as const;

  return {
    element: form,
    focus: () => title.input.focus(),
    reset: () => {
      title.input.value = '';
      dueDate.input.value = today();
    },
    setErrors: (errors) => {
      let focused = false;
      for (const key of ['title', 'dueDate'] as const) {
        const message = errors[key];
        fields[key].setError(message);
        // Send focus to the first field that failed, so a keyboard or screen
        // reader user lands on the problem rather than hunting for it.
        if (message && !focused) {
          fields[key].input.focus();
          focused = true;
        }
      }
    },
  };
}

interface FieldHandle {
  wrapper: HTMLDivElement;
  input: HTMLInputElement;
  setError(message: string | undefined): void;
}

function buildField(options: {
  id: string;
  name: string;
  label: string;
  type: string;
  className: string;
}): FieldHandle {
  const wrapper = document.createElement('div');
  wrapper.className = `field ${options.className}`;

  const label = document.createElement('label');
  label.htmlFor = options.id;
  label.textContent = options.label;

  const input = document.createElement('input');
  input.id = options.id;
  input.name = options.name;
  input.type = options.type;

  const error = document.createElement('p');
  error.id = `${options.id}-error`;
  error.className = 'field__error';
  // role=alert makes the message announced as soon as it appears.
  error.setAttribute('role', 'alert');
  error.hidden = true;

  wrapper.append(label, input, error);

  return {
    wrapper,
    input,
    setError(message) {
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
    },
  };
}

/** Today as an ISO calendar date, used as the default due date. */
export function today(now: Date = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}
