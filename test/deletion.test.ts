import { beforeEach, describe, expect, it } from 'vitest';
import { TaskStore } from '../src/domain/taskStore';
import { TaskStorage } from '../src/storage/taskStorage';
import { MemoryStorage } from '../src/storage/safeStorage';
import { mountApp } from '../src/ui/app';
import { mountTestApp } from './helpers/mountApp';

function click(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

function within(row: HTMLElement, selector: string): HTMLElement {
  const el = row.querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`expected ${selector} in the row`);
  return el;
}

describe('deleting a task', () => {
  beforeEach(() => document.body.replaceChildren());

  it('asks for confirmation before removing anything', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15T09:00');
    const row = ui.row(ui.store.getTasks()[0]!.id);

    click(within(row, '.task__delete'));

    expect(within(row, '.task__confirm').hidden).toBe(false);
    expect(within(row, '.task__delete').hidden).toBe(true);
    // Nothing is gone yet.
    expect(ui.store.getTasks()).toHaveLength(1);
    expect(ui.persisted()).toHaveLength(1);
  });

  it('removes the task from the list and storage once confirmed', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15T09:00');
    const row = ui.row(ui.store.getTasks()[0]!.id);

    click(within(row, '.task__delete'));
    click(within(row, '.task__confirm-delete'));

    expect(ui.titles()).toEqual([]);
    expect(ui.store.getTasks()).toEqual([]);
    expect(ui.persisted()).toEqual([]);
  });

  it('keeps the task when the confirmation is cancelled', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15T09:00');
    const row = ui.row(ui.store.getTasks()[0]!.id);

    click(within(row, '.task__delete'));
    click(within(row, '.task__cancel-delete'));

    expect(ui.titles()).toEqual(['Buy milk']);
    expect(within(row, '.task__confirm').hidden).toBe(true);
    expect(within(row, '.task__delete').hidden).toBe(false);
  });

  it('deletes only the confirmed task and re-renders immediately', () => {
    const ui = mountTestApp();
    ui.submit('First', '2026-01-01T09:00');
    ui.submit('Second', '2026-02-01T09:00');
    ui.submit('Third', '2026-03-01T09:00');
    const second = ui.store.getTasks().find((t) => t.title === 'Second')!;

    const row = ui.row(second.id);
    click(within(row, '.task__delete'));
    click(within(row, '.task__confirm-delete'));

    expect(ui.titles()).toEqual(['First', 'Third']);
  });

  it('deletes a completed task the same way as an incomplete one', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15T09:00');
    const id = ui.store.getTasks()[0]!.id;
    const checkbox = ui.checkboxes()[0]!;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

    const row = ui.row(id);
    click(within(row, '.task__delete'));
    click(within(row, '.task__confirm-delete'));

    expect(ui.store.getTasks()).toEqual([]);
  });

  it('does not bring a deleted task back after a reload', () => {
    const root = document.createElement('div');
    document.body.replaceChildren(root);
    const backing = new MemoryStorage();
    mountApp(root, new TaskStore(new TaskStorage(backing)));

    const form = root.querySelector<HTMLFormElement>('form')!;
    root.querySelector<HTMLInputElement>('#task-title')!.value = 'Buy milk';
    root.querySelector<HTMLInputElement>('#task-due-date')!.value = '2026-01-15T09:00';
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    click(root.querySelector<HTMLElement>('.task__delete')!);
    click(root.querySelector<HTMLElement>('.task__confirm-delete')!);

    const reloaded = document.createElement('div');
    document.body.replaceChildren(reloaded);
    mountApp(reloaded, new TaskStore(new TaskStorage(backing)));

    expect(reloaded.querySelectorAll('.task')).toHaveLength(0);
  });

  it('names the task in every delete control for assistive technology', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15T09:00');
    const row = ui.row(ui.store.getTasks()[0]!.id);

    expect(within(row, '.task__delete').getAttribute('aria-label')).toContain('Buy milk');
    expect(within(row, '.task__confirm-delete').getAttribute('aria-label')).toContain(
      'Buy milk',
    );
  });
});
