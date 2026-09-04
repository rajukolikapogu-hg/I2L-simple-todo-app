import { beforeEach, describe, expect, it } from 'vitest';
import { TaskStore } from '../src/domain/taskStore';
import { TaskStorage } from '../src/storage/taskStorage';
import { MemoryStorage } from '../src/storage/safeStorage';
import { mountApp } from '../src/ui/app';
import { sortByDueDate } from '../src/domain/sortTasks';
import { createTask } from '../src/domain/task';

function mount() {
  const root = document.createElement('div');
  document.body.replaceChildren(root);
  const backing = new MemoryStorage();
  const store = new TaskStore(new TaskStorage(backing));
  mountApp(root, store);

  const title = root.querySelector<HTMLInputElement>('#task-title')!;
  const dueDate = root.querySelector<HTMLInputElement>('#task-due-date')!;
  const form = root.querySelector<HTMLFormElement>('form')!;

  return {
    root,
    store,
    backing,
    title,
    dueDate,
    submit(taskTitle: string, date: string) {
      title.value = taskTitle;
      dueDate.value = date;
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    },
    titles: () =>
      [...root.querySelectorAll('.task__title')].map((el) => el.textContent ?? ''),
  };
}

describe('creating a task', () => {
  beforeEach(() => document.body.replaceChildren());

  it('adds the task to the list and to storage', () => {
    const ui = mount();

    ui.submit('Buy milk', '2026-01-15');

    expect(ui.titles()).toEqual(['Buy milk']);
    const stored = ui.store.getTasks();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ title: 'Buy milk', dueDate: '2026-01-15' });
  });

  it('places a new task in due-date order without a reload', () => {
    const ui = mount();

    ui.submit('Later', '2026-03-01');
    ui.submit('Sooner', '2026-01-05');
    ui.submit('Middle', '2026-02-01');

    expect(ui.titles()).toEqual(['Sooner', 'Middle', 'Later']);
  });

  it('gives every task a unique id and a creation timestamp', () => {
    const ui = mount();

    ui.submit('One', '2026-01-01');
    ui.submit('Two', '2026-01-02');

    const tasks = ui.store.getTasks();
    expect(new Set(tasks.map((t) => t.id)).size).toBe(2);
    for (const task of tasks) {
      expect(Number.isNaN(Date.parse(task.createdAt))).toBe(false);
    }
  });

  it('clears the fields and returns focus to the title after a creation', () => {
    const ui = mount();

    ui.submit('Buy milk', '2026-01-15');

    expect(ui.title.value).toBe('');
    expect(document.activeElement).toBe(ui.title);
  });

  it('renders a title containing markup as plain text', () => {
    const ui = mount();

    ui.submit('<img src=x onerror=alert(1)>', '2026-01-15');

    expect(ui.titles()).toEqual(['<img src=x onerror=alert(1)>']);
    expect(ui.root.querySelector('img')).toBeNull();
  });
});

describe('sortByDueDate', () => {
  it('orders soonest first and is stable for equal due dates', () => {
    const a = { ...createTask({ title: 'a', dueDate: '2026-01-01' }), createdAt: '1' };
    const b = { ...createTask({ title: 'b', dueDate: '2026-01-01' }), createdAt: '2' };
    const c = { ...createTask({ title: 'c', dueDate: '2025-12-01' }), createdAt: '3' };

    expect(sortByDueDate([b, c, a]).map((t) => t.title)).toEqual(['c', 'a', 'b']);
  });

  it('does not mutate the input array', () => {
    const tasks = [
      createTask({ title: 'late', dueDate: '2026-05-01' }),
      createTask({ title: 'early', dueDate: '2026-01-01' }),
    ];

    sortByDueDate(tasks);
    expect(tasks.map((t) => t.title)).toEqual(['late', 'early']);
  });
});
