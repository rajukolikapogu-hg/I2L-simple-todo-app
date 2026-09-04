import { beforeEach, describe, expect, it } from 'vitest';
import { TaskStore } from '../src/domain/taskStore';
import { TaskStorage } from '../src/storage/taskStorage';
import { MemoryStorage } from '../src/storage/safeStorage';
import { mountApp } from '../src/ui/app';
import { INVALID_DUE_DATE_MESSAGE, formatDueDate } from '../src/ui/taskList';
import { mountTestApp } from './helpers/mountApp';

function click(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

function within<T extends HTMLElement>(row: HTMLElement, selector: string): T {
  const el = row.querySelector<T>(selector);
  if (!el) throw new Error(`expected ${selector} in the row`);
  return el;
}

/** Opens the editor on a row and returns its parts. */
function openEditor(row: HTMLElement) {
  click(within(row, '.task__edit-due'));
  return {
    input: within<HTMLInputElement>(row, '.task__due-input'),
    save: within(row, '.task__save-due'),
    cancel: within(row, '.task__cancel-due'),
    error: within(row, '.task__due-error'),
  };
}

describe('editing a due date', () => {
  beforeEach(() => document.body.replaceChildren());

  it('opens an editor pre-filled with the current due date', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15');
    const editor = openEditor(ui.row(ui.store.getTasks()[0]!.id));

    expect(editor.input.value).toBe('2026-01-15');
  });

  it('updates the displayed date on save', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15');
    const id = ui.store.getTasks()[0]!.id;

    const editor = openEditor(ui.row(id));
    editor.input.value = '2026-03-20';
    click(editor.save);

    expect(ui.store.getTasks()[0]!.dueDate).toBe('2026-03-20');
    const time = within<HTMLTimeElement>(ui.row(id), '.task__due');
    expect(time.dateTime).toBe('2026-03-20');
    expect(time.textContent).toBe(formatDueDate('2026-03-20'));
  });

  it.each([
    ['an empty value', ''],
    ['an impossible calendar date', '2026-02-31'],
    ['a non-date string', 'tomorrow'],
  ])('rejects %s and retains the prior value', (_label, value) => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15');
    const id = ui.store.getTasks()[0]!.id;

    const editor = openEditor(ui.row(id));
    editor.input.value = value;
    click(editor.save);

    expect(ui.store.getTasks()[0]!.dueDate).toBe('2026-01-15');
    expect(ui.persisted()[0]!.dueDate).toBe('2026-01-15');
    expect(editor.error.hidden).toBe(false);
    expect(editor.error.textContent).toBe(INVALID_DUE_DATE_MESSAGE);
    expect(editor.input.getAttribute('aria-invalid')).toBe('true');
  });

  it('discards an abandoned edit on cancel', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15');
    const id = ui.store.getTasks()[0]!.id;

    const editor = openEditor(ui.row(id));
    editor.input.value = '2026-09-09';
    click(editor.cancel);

    expect(ui.store.getTasks()[0]!.dueDate).toBe('2026-01-15');
    // Re-opening shows the stored value, not the abandoned edit.
    expect(openEditor(ui.row(id)).input.value).toBe('2026-01-15');
  });

  it('saves on Enter and closes on Escape', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15');
    const id = ui.store.getTasks()[0]!.id;

    const editor = openEditor(ui.row(id));
    editor.input.value = '2026-04-04';
    editor.input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
    expect(ui.store.getTasks()[0]!.dueDate).toBe('2026-04-04');

    const reopened = openEditor(ui.row(id));
    reopened.input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    expect(within(ui.row(id), '.task__due-editor').hidden).toBe(true);
  });

  it('keeps the changed due date across a reload', () => {
    const root = document.createElement('div');
    document.body.replaceChildren(root);
    const backing = new MemoryStorage();
    mountApp(root, new TaskStore(new TaskStorage(backing)));

    const form = root.querySelector<HTMLFormElement>('form')!;
    root.querySelector<HTMLInputElement>('#task-title')!.value = 'Buy milk';
    root.querySelector<HTMLInputElement>('#task-due-date')!.value = '2026-01-15';
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    click(root.querySelector<HTMLElement>('.task__edit-due')!);
    root.querySelector<HTMLInputElement>('.task__due-input')!.value = '2026-07-01';
    click(root.querySelector<HTMLElement>('.task__save-due')!);

    const reloaded = document.createElement('div');
    document.body.replaceChildren(reloaded);
    mountApp(reloaded, new TaskStore(new TaskStorage(backing)));

    expect(reloaded.querySelector<HTMLTimeElement>('.task__due')!.dateTime).toBe(
      '2026-07-01',
    );
  });
});
