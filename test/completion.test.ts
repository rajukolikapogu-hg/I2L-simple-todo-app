import { beforeEach, describe, expect, it } from 'vitest';
import { TaskStore } from '../src/domain/taskStore';
import { TaskStorage } from '../src/storage/taskStorage';
import { MemoryStorage } from '../src/storage/safeStorage';
import { mountApp } from '../src/ui/app';
import { mountTestApp } from './helpers/mountApp';

/** Clicks a checkbox the way a user would, so the change handler fires. */
function toggle(checkbox: HTMLInputElement): void {
  checkbox.checked = !checkbox.checked;
  checkbox.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('completing a task', () => {
  beforeEach(() => document.body.replaceChildren());

  it('marks the task complete and keeps it in the list', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15');
    const id = ui.store.getTasks()[0]!.id;

    toggle(ui.checkboxes()[0]!);

    expect(ui.store.getTasks()[0]!.completed).toBe(true);
    expect(ui.titles()).toEqual(['Buy milk']);
    expect(ui.row(id).classList.contains('task--completed')).toBe(true);
  });

  it('restores normal styling when un-ticked', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15');
    const id = ui.store.getTasks()[0]!.id;

    toggle(ui.checkboxes()[0]!);
    toggle(ui.checkboxes()[0]!);

    expect(ui.store.getTasks()[0]!.completed).toBe(false);
    expect(ui.row(id).classList.contains('task--completed')).toBe(false);
  });

  it('toggles only the task that was clicked', () => {
    const ui = mountTestApp();
    ui.submit('First', '2026-01-01');
    ui.submit('Second', '2026-02-01');

    toggle(ui.checkboxes()[1]!);

    expect(ui.store.getTasks().map((t) => [t.title, t.completed])).toEqual([
      ['First', false],
      ['Second', true],
    ]);
  });

  it('persists completion across a reload', () => {
    const root = document.createElement('div');
    document.body.replaceChildren(root);
    const backing = new MemoryStorage();
    mountApp(root, new TaskStore(new TaskStorage(backing)));

    const form = root.querySelector<HTMLFormElement>('form')!;
    root.querySelector<HTMLInputElement>('#task-title')!.value = 'Buy milk';
    root.querySelector<HTMLInputElement>('#task-due-date')!.value = '2026-01-15';
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    toggle(root.querySelector<HTMLInputElement>('.task__checkbox')!);

    // Re-mount over the same storage, which is what a page reload amounts to.
    const reloaded = document.createElement('div');
    document.body.replaceChildren(reloaded);
    mountApp(reloaded, new TaskStore(new TaskStorage(backing)));

    expect(reloaded.querySelector<HTMLInputElement>('.task__checkbox')!.checked).toBe(
      true,
    );
    expect(reloaded.querySelector('.task--completed')).not.toBeNull();
  });

  it('gives each checkbox an accessible name naming its task', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15');

    expect(ui.checkboxes()[0]!.getAttribute('aria-label')).toContain('Buy milk');
  });
});
