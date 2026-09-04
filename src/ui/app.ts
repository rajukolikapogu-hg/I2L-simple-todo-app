import { sortByDueDate } from '../domain/sortTasks';
import type { TaskStore } from '../domain/taskStore';
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

  main.append(heading, form.element, list);
  root.replaceChildren(main);

  const render = (): void =>
    renderTaskList(list, sortByDueDate(store.getTasks()), {
      onToggleComplete: (id, completed) => store.update(id, { completed }),
    });
  store.subscribe(render);
  render();
}
