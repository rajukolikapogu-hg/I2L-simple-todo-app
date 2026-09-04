import { beforeEach, describe, expect, it } from 'vitest';
import { TaskStore } from '../src/domain/taskStore';
import { TaskStorage } from '../src/storage/taskStorage';
import { MemoryStorage } from '../src/storage/safeStorage';
import { mountApp } from '../src/ui/app';
import { mountTestApp } from './helpers/mountApp';

function click(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

/** Edits a task's due date through the UI, the way a user would. */
function editDueDate(root: HTMLElement, taskId: string, dueDate: string): void {
  const row = root.querySelector<HTMLLIElement>(`li[data-task-id="${taskId}"]`);
  if (!row) throw new Error(`expected a row for task ${taskId}`);
  click(row.querySelector<HTMLElement>('.task__edit-due')!);
  row.querySelector<HTMLInputElement>('.task__due-input')!.value = dueDate;
  click(row.querySelector<HTMLElement>('.task__save-due')!);
}

describe('re-ordering after a due-date change', () => {
  beforeEach(() => document.body.replaceChildren());

  it('moves a task to the front when its date is brought forward', () => {
    const ui = mountTestApp();
    ui.submit('First', '2026-01-01');
    ui.submit('Second', '2026-02-01');
    ui.submit('Third', '2026-03-01');
    const third = ui.store.getTasks().find((t) => t.title === 'Third')!;

    editDueDate(ui.root, third.id, '2025-12-01');

    expect(ui.titles()).toEqual(['Third', 'First', 'Second']);
  });

  it('moves a task to the back when its date is pushed out', () => {
    const ui = mountTestApp();
    ui.submit('First', '2026-01-01');
    ui.submit('Second', '2026-02-01');
    ui.submit('Third', '2026-03-01');
    const first = ui.store.getTasks().find((t) => t.title === 'First')!;

    editDueDate(ui.root, first.id, '2026-12-31');

    expect(ui.titles()).toEqual(['Second', 'Third', 'First']);
  });

  it('re-sorts immediately, without a reload', () => {
    const ui = mountTestApp();
    ui.submit('A', '2026-05-01');
    ui.submit('B', '2026-06-01');
    const b = ui.store.getTasks().find((t) => t.title === 'B')!;

    editDueDate(ui.root, b.id, '2026-01-01');

    // Read straight back off the live DOM — no re-mount in between.
    expect(ui.titles()).toEqual(['B', 'A']);
  });

  it('leaves the order untouched when an invalid date is rejected', () => {
    const ui = mountTestApp();
    ui.submit('First', '2026-01-01');
    ui.submit('Second', '2026-02-01');
    const second = ui.store.getTasks().find((t) => t.title === 'Second')!;

    editDueDate(ui.root, second.id, '');

    expect(ui.titles()).toEqual(['First', 'Second']);
  });

  it('keeps focus on the moved task after the list re-sorts', () => {
    const ui = mountTestApp();
    ui.submit('First', '2026-01-01');
    ui.submit('Second', '2026-02-01');
    const second = ui.store.getTasks().find((t) => t.title === 'Second')!;

    editDueDate(ui.root, second.id, '2025-01-01');

    // The row was destroyed and rebuilt in a new position; focus should follow
    // it rather than falling back to the document body.
    const moved = ui.row(second.id).querySelector('.task__edit-due');
    expect(document.activeElement).toBe(moved);
  });

  it('keeps the re-ordered list across a reload', () => {
    const root = document.createElement('div');
    document.body.replaceChildren(root);
    const backing = new MemoryStorage();
    const store = new TaskStore(new TaskStorage(backing));
    mountApp(root, store);

    const form = root.querySelector<HTMLFormElement>('form')!;
    const add = (title: string, date: string): void => {
      root.querySelector<HTMLInputElement>('#task-title')!.value = title;
      root.querySelector<HTMLInputElement>('#task-due-date')!.value = date;
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    };
    add('First', '2026-01-01');
    add('Second', '2026-02-01');
    add('Third', '2026-03-01');

    const third = store.getTasks().find((t) => t.title === 'Third')!;
    editDueDate(root, third.id, '2025-11-01');

    const reloaded = document.createElement('div');
    document.body.replaceChildren(reloaded);
    mountApp(reloaded, new TaskStore(new TaskStorage(backing)));

    expect(
      [...reloaded.querySelectorAll('.task__title')].map((el) => el.textContent),
    ).toEqual(['Third', 'First', 'Second']);
  });
});
