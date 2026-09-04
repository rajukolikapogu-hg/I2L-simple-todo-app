import { beforeEach, describe, expect, it } from 'vitest';
import { mountTestApp } from './helpers/mountApp';

/**
 * The elements a browser would put in the tab order: focusable, and not inside
 * anything hidden. Mirrors what Tab actually reaches.
 */
function tabbable(root: HTMLElement): HTMLElement[] {
  const selector = 'a[href], button, input, select, textarea, [tabindex]';
  return [...root.querySelectorAll<HTMLElement>(selector)].filter((el) => {
    if (el.hasAttribute('disabled') || el.getAttribute('tabindex') === '-1') {
      return false;
    }
    return !el.closest('[hidden]');
  });
}

function click(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

function press(el: HTMLElement, key: string): void {
  el.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
  );
}

describe('keyboard operation', () => {
  beforeEach(() => document.body.replaceChildren());

  it('puts every primary action in the tab order, in reading order', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15');

    const ids = tabbable(ui.root).map(
      (el) =>
        el.id ||
        [...el.classList].find((c) => c.startsWith('task__')) ||
        el.tagName.toLowerCase(),
    );

    expect(ids).toEqual([
      'task-title',
      'task-due-date',
      'button', // Add task
      'task__checkbox',
      'task__edit-due',
      'task__delete',
    ]);
  });

  it('keeps hidden controls out of the tab order until they are shown', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15');
    const row = ui.row(ui.store.getTasks()[0]!.id);

    const classesOf = () => tabbable(ui.root).flatMap((el) => [...el.classList]);

    expect(classesOf()).not.toContain('task__due-input');
    expect(classesOf()).not.toContain('task__confirm-delete');

    click(row.querySelector<HTMLElement>('.task__edit-due')!);
    expect(classesOf()).toContain('task__due-input');
    // The control it replaced is now out of the tab order.
    expect(classesOf()).not.toContain('task__edit-due');
  });

  it('completes the whole lifecycle without a pointer', () => {
    const ui = mountTestApp();

    // Create: type and press Enter, which submits the form natively.
    ui.title.value = 'Buy milk';
    ui.dueDate.value = '2026-01-15';
    ui.form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    expect(ui.titles()).toEqual(['Buy milk']);

    const id = ui.store.getTasks()[0]!.id;

    // Complete: Space on a native checkbox toggles it and fires change.
    const checkbox = ui.checkboxes()[0]!;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    expect(ui.store.getTasks()[0]!.completed).toBe(true);

    // Edit: open, type, Enter to save.
    click(ui.row(id).querySelector<HTMLElement>('.task__edit-due')!);
    const input = ui.row(id).querySelector<HTMLInputElement>('.task__due-input')!;
    input.value = '2026-02-20';
    press(input, 'Enter');
    expect(ui.store.getTasks()[0]!.dueDate).toBe('2026-02-20');

    // Delete: activate, then confirm.
    const row = ui.row(id);
    click(row.querySelector<HTMLElement>('.task__delete')!);
    click(row.querySelector<HTMLElement>('.task__confirm-delete')!);
    expect(ui.store.getTasks()).toEqual([]);
  });

  it('never leaves focus on an element that has just been hidden', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15');
    const row = ui.row(ui.store.getTasks()[0]!.id);

    click(row.querySelector<HTMLElement>('.task__delete')!);
    expect(document.activeElement).toBe(row.querySelector('.task__confirm-delete'));

    click(row.querySelector<HTMLElement>('.task__cancel-delete')!);
    expect(document.activeElement).toBe(row.querySelector('.task__delete'));

    click(row.querySelector<HTMLElement>('.task__edit-due')!);
    expect(document.activeElement).toBe(row.querySelector('.task__due-input'));

    press(row.querySelector<HTMLElement>('.task__due-input')!, 'Escape');
    expect(document.activeElement).toBe(row.querySelector('.task__edit-due'));
  });

  it('uses real buttons and a real checkbox so activation comes from the platform', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15');
    const row = ui.row(ui.store.getTasks()[0]!.id);

    for (const selector of ['.task__edit-due', '.task__delete']) {
      const el = row.querySelector<HTMLButtonElement>(selector)!;
      expect(el.tagName).toBe('BUTTON');
      // type=button, so a stray Enter cannot submit an enclosing form.
      expect(el.type).toBe('button');
    }
    expect(ui.checkboxes()[0]!.type).toBe('checkbox');
  });
});
