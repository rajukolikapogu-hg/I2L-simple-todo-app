import axe from 'axe-core';
import { beforeEach, describe, expect, it } from 'vitest';
import { mountTestApp } from './helpers/mountApp';

function click(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

/**
 * The rules that answer "does every control have an accessible name?". Scoped
 * deliberately: jsdom has no layout engine, so colour-contrast and other
 * geometry-dependent rules cannot produce a trustworthy verdict here and would
 * only add noise. Those belong in the cross-browser QA pass.
 */
const LABEL_RULES = [
  'label',
  'form-field-multiple-labels',
  'aria-input-field-name',
  'aria-toggle-field-name',
  'button-name',
  'aria-command-name',
  'input-button-name',
  'select-name',
  'aria-valid-attr-value',
  'aria-required-attr',
  'empty-heading',
];

async function auditLabels(root: HTMLElement): Promise<axe.Result[]> {
  const results = await axe.run(root, {
    runOnly: { type: 'rule', values: LABEL_RULES },
  });
  return results.violations;
}

/** Turns violations into something readable when an assertion fails. */
function describeViolations(violations: axe.Result[]): string[] {
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(', ')}`);
}

describe('accessible names', () => {
  beforeEach(() => document.body.replaceChildren());

  it('labels the create-task form inputs', () => {
    const ui = mountTestApp();

    const titleLabel = ui.q<HTMLLabelElement>('label[for="task-title"]');
    const dateLabel = ui.q<HTMLLabelElement>('label[for="task-due-date"]');

    expect(titleLabel.textContent).toBe('Task');
    expect(dateLabel.textContent).toBe('Due date');
  });

  it('names every control on a task row after its task', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15');
    const row = ui.row(ui.store.getTasks()[0]!.id);

    const named = [
      '.task__checkbox',
      '.task__edit-due',
      '.task__delete',
    ].map((selector) => row.querySelector(selector)!.getAttribute('aria-label'));

    for (const name of named) {
      expect(name).toContain('Buy milk');
    }
  });

  it('names the controls revealed by the editor and the delete confirmation', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15');
    const row = ui.row(ui.store.getTasks()[0]!.id);

    click(row.querySelector<HTMLElement>('.task__edit-due')!);
    click(row.querySelector<HTMLElement>('.task__delete')!);

    for (const selector of [
      '.task__due-input',
      '.task__save-due',
      '.task__cancel-due',
      '.task__confirm-delete',
      '.task__cancel-delete',
    ]) {
      expect(row.querySelector(selector)!.getAttribute('aria-label')).toContain(
        'Buy milk',
      );
    }
  });

  it('names the form and list regions', () => {
    const ui = mountTestApp();

    expect(ui.form.getAttribute('aria-labelledby')).toBe('add-task-heading');
    expect(ui.q('#add-task-heading').textContent).toBe('Add a task');
    expect(ui.q('.task-list').getAttribute('aria-label')).not.toBeNull();
  });

  it('reports no missing-label violations on the empty app', async () => {
    const ui = mountTestApp();

    const violations = await auditLabels(ui.root);
    expect(describeViolations(violations)).toEqual([]);
  });

  it('reports no missing-label violations with tasks and every control open', async () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15');
    ui.submit('Call the bank', '2026-02-01');
    const row = ui.row(ui.store.getTasks()[0]!.id);

    // Open the editor and the confirmation, so the audit also sees the controls
    // that only exist once revealed.
    click(row.querySelector<HTMLElement>('.task__edit-due')!);
    click(row.querySelector<HTMLElement>('.task__delete')!);

    const violations = await auditLabels(ui.root);
    expect(describeViolations(violations)).toEqual([]);
  });

  it('reports no missing-label violations while a validation error is showing', async () => {
    const ui = mountTestApp();
    ui.submit('   ', '2026-01-15');

    const violations = await auditLabels(ui.root);
    expect(describeViolations(violations)).toEqual([]);
  });
});
