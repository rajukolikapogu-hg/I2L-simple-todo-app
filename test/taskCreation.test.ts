import { beforeEach, describe, expect, it } from 'vitest';
import { sortByDueDate } from '../src/domain/sortTasks';
import { createTask } from '../src/domain/task';
import { mountTestApp } from './helpers/mountApp';

describe('creating a task', () => {
  beforeEach(() => document.body.replaceChildren());

  it('adds the task to the list and to storage', () => {
    const ui = mountTestApp();

    ui.submit('Buy milk', '2026-01-15');

    expect(ui.titles()).toEqual(['Buy milk']);
    const stored = ui.store.getTasks();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ title: 'Buy milk', dueDate: '2026-01-15' });
  });

  it('places a new task in due-date order without a reload', () => {
    const ui = mountTestApp();

    ui.submit('Later', '2026-03-01');
    ui.submit('Sooner', '2026-01-05');
    ui.submit('Middle', '2026-02-01');

    expect(ui.titles()).toEqual(['Sooner', 'Middle', 'Later']);
  });

  it('gives every task a unique id and a creation timestamp', () => {
    const ui = mountTestApp();

    ui.submit('One', '2026-01-01');
    ui.submit('Two', '2026-01-02');

    const tasks = ui.store.getTasks();
    expect(new Set(tasks.map((t) => t.id)).size).toBe(2);
    for (const task of tasks) {
      expect(Number.isNaN(Date.parse(task.createdAt))).toBe(false);
    }
  });

  it('clears the fields and returns focus to the title after a creation', () => {
    const ui = mountTestApp();

    ui.submit('Buy milk', '2026-01-15');

    expect(ui.title.value).toBe('');
    expect(document.activeElement).toBe(ui.title);
  });

  it('renders a title containing markup as plain text', () => {
    const ui = mountTestApp();

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
