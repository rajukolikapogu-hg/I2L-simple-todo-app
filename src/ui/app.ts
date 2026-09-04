import { sortByDueDate } from '../domain/sortTasks';
import type { TaskStore } from '../domain/taskStore';
import { isIsoDate } from '../domain/task';
import { validateNewTask } from '../domain/validation';
import { createTaskForm } from './taskForm';
import { renderTaskList } from './taskList';

/** Builds the app shell into `root` and keeps it in sync with the store. */
export function mountApp(root: HTMLElement, store: TaskStore): void {
  const main = document.createElement('main');
  main.className = 'app';

  const heading = document.createElement('h1');
  heading.textContent = 'Simple Todo App';

  const form = createTaskForm((input) => {
    const { valid, errors } = validateNewTask(input);
    form.setErrors(errors);
    if (!valid) return;

    store.add(input);
    form.reset();
    form.focus();
  });

  const list = document.createElement('ul');
  list.className = 'task-list';
  // The list is the single source of truth on screen and is rebuilt wholesale on
  // every change, so announce it as a live region rather than trying to describe
  // each individual mutation.
  list.setAttribute('aria-live', 'polite');
  list.setAttribute('aria-label', 'Tasks, soonest due first');

  main.append(heading, form.element, list);
  root.replaceChildren(main);

  const render = (): void =>
    renderTaskList(list, sortByDueDate(store.getTasks()), {
      onToggleComplete: (id, completed) => store.update(id, { completed }),
      onDelete: (id) => store.remove(id),
      onEditDueDate: (id, dueDate) => {
        // Reject rather than persist: the row keeps the prior value on screen
        // and surfaces the message itself.
        if (!isIsoDate(dueDate)) return false;
        store.update(id, { dueDate });
        return true;
      },
    });
  store.subscribe(render);
  render();
}
