import { TaskStore } from '../../src/domain/taskStore';
import { TaskStorage, STORAGE_KEY } from '../../src/storage/taskStorage';
import { MemoryStorage } from '../../src/storage/safeStorage';
import type { Task } from '../../src/domain/task';
import { mountApp } from '../../src/ui/app';

/** Mounts the app over fresh in-memory storage and returns handles for tests. */
export function mountTestApp() {
  const root = document.createElement('div');
  document.body.replaceChildren(root);
  const backing = new MemoryStorage();
  const store = new TaskStore(new TaskStorage(backing));
  mountApp(root, store);

  const q = <T extends Element>(selector: string): T => {
    const el = root.querySelector<T>(selector);
    if (!el) throw new Error(`expected to find ${selector}`);
    return el;
  };

  const title = q<HTMLInputElement>('#task-title');
  const dueDate = q<HTMLInputElement>('#task-due-date');
  const form = q<HTMLFormElement>('form');

  return {
    root,
    store,
    title,
    dueDate,
    form,
    q,
    submit(taskTitle: string, date?: string) {
      title.value = taskTitle;
      if (date !== undefined) dueDate.value = date;
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    },
    titles: (): string[] =>
      [...root.querySelectorAll('.task__title')].map((el) => el.textContent ?? ''),
    /** What is actually written to storage, as opposed to what is in memory. */
    persisted: (): Task[] => {
      const raw = backing.getItem(STORAGE_KEY);
      return raw === null ? [] : (JSON.parse(raw) as { tasks: Task[] }).tasks;
    },
  };
}
