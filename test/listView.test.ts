import { beforeEach, describe, expect, it } from 'vitest';
import { EMPTY_STATE_MESSAGE } from '../src/ui/taskList';
import { mountTestApp } from './helpers/mountApp';

function click(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

describe('the task list', () => {
  beforeEach(() => document.body.replaceChildren());

  it('shows tasks in ascending due-date order whatever order they were created', () => {
    const ui = mountTestApp();

    ui.submit('Middle', '2026-06-15T09:00');
    ui.submit('Last', '2026-12-01T09:00');
    ui.submit('First', '2026-01-02T09:00');

    expect(ui.titles()).toEqual(['First', 'Middle', 'Last']);
  });

  it('keeps completed tasks inline in the sorted list, visually distinguished', () => {
    const ui = mountTestApp();
    ui.submit('First', '2026-01-01T09:00');
    ui.submit('Second', '2026-02-01T09:00');
    ui.submit('Third', '2026-03-01T09:00');

    const checkbox = ui.checkboxes()[1]!;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

    // Still in position 2, not moved to the bottom or hidden.
    expect(ui.titles()).toEqual(['First', 'Second', 'Third']);
    const rows = [...ui.root.querySelectorAll('.task')];
    expect(rows[1]!.classList.contains('task--completed')).toBe(true);
    expect(rows[0]!.classList.contains('task--completed')).toBe(false);
  });

  it('re-renders on add, complete and delete', () => {
    const ui = mountTestApp();

    ui.submit('Later', '2026-05-01T09:00');
    expect(ui.titles()).toEqual(['Later']);

    ui.submit('Sooner', '2026-02-01T09:00');
    expect(ui.titles()).toEqual(['Sooner', 'Later']);

    const checkbox = ui.checkboxes()[0]!;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    expect(ui.root.querySelectorAll('.task--completed')).toHaveLength(1);

    const row = ui.row(ui.store.getTasks().find((t) => t.title === 'Later')!.id);
    click(row.querySelector<HTMLElement>('.task__delete')!);
    click(row.querySelector<HTMLElement>('.task__confirm-delete')!);
    expect(ui.titles()).toEqual(['Sooner']);
  });

  it('shows a friendly empty state instead of a blank area', () => {
    const ui = mountTestApp();

    const empty = ui.q<HTMLLIElement>('.task-list__empty');
    expect(empty.textContent).toBe(EMPTY_STATE_MESSAGE);
    expect(ui.root.querySelectorAll('.task')).toHaveLength(0);
  });

  it('replaces the empty state with the task, and restores it once emptied', () => {
    const ui = mountTestApp();

    ui.submit('Buy milk', '2026-01-15T09:00');
    expect(ui.root.querySelector('.task-list__empty')).toBeNull();

    const row = ui.row(ui.store.getTasks()[0]!.id);
    click(row.querySelector<HTMLElement>('.task__delete')!);
    click(row.querySelector<HTMLElement>('.task__confirm-delete')!);

    expect(ui.q<HTMLLIElement>('.task-list__empty').textContent).toBe(
      EMPTY_STATE_MESSAGE,
    );
  });

  it('announces the list as a labelled live region', () => {
    const ui = mountTestApp();
    const list = ui.q<HTMLUListElement>('.task-list');

    expect(list.getAttribute('aria-live')).toBe('polite');
    expect(list.getAttribute('aria-label')).not.toBeNull();
  });
});
