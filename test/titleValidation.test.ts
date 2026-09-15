import { beforeEach, describe, expect, it } from 'vitest';
import {
  BLANK_TITLE_MESSAGE,
  INVALID_DATE_MESSAGE,
  validateNewTask,
} from '../src/domain/validation';
import { mountTestApp } from './helpers/mountApp';

describe('validateNewTask', () => {
  it('accepts a title and a valid ISO due date', () => {
    expect(validateNewTask({ title: 'Buy milk', dueDate: '2026-01-15T09:00' })).toEqual({
      valid: true,
      errors: {},
    });
  });

  it.each(['', '   ', '\t', '\n  \n'])('rejects the blank title %j', (title) => {
    const result = validateNewTask({ title, dueDate: '2026-01-15T09:00' });

    expect(result.valid).toBe(false);
    expect(result.errors.title).toBe(BLANK_TITLE_MESSAGE);
  });

  it('rejects an empty or malformed due date', () => {
    expect(validateNewTask({ title: 'ok', dueDate: '' }).errors.dueDate).toBe(
      INVALID_DATE_MESSAGE,
    );
    expect(
      validateNewTask({ title: 'ok', dueDate: '2026-02-31T09:00' }).errors.dueDate,
    ).toBe(INVALID_DATE_MESSAGE);
    expect(validateNewTask({ title: 'ok', dueDate: '2026-01-15' }).errors.dueDate).toBe(
      INVALID_DATE_MESSAGE,
    );
  });
});

describe('blank titles in the form', () => {
  beforeEach(() => document.body.replaceChildren());

  it.each(['', '   '])('blocks submission of the title %j', (title) => {
    const ui = mountTestApp();

    ui.submit(title, '2026-01-15T09:00');

    expect(ui.titles()).toEqual([]);
    expect(ui.store.getTasks()).toEqual([]);
    expect(ui.persisted()).toEqual([]);
  });

  it('shows a clear message tied to the title field', () => {
    const ui = mountTestApp();

    ui.submit('  ', '2026-01-15T09:00');

    const error = ui.q<HTMLParagraphElement>('#task-title-error');
    expect(error.hidden).toBe(false);
    expect(error.textContent).toBe(BLANK_TITLE_MESSAGE);
    expect(ui.title.getAttribute('aria-invalid')).toBe('true');
    expect(ui.title.getAttribute('aria-describedby')).toBe('task-title-error');
    expect(document.activeElement).toBe(ui.title);
  });

  it('keeps what the user typed instead of clearing the form', () => {
    const ui = mountTestApp();

    ui.submit('   ', '2026-01-15T09:00');

    expect(ui.title.value).toBe('   ');
  });

  it('clears the message once a valid title is submitted', () => {
    const ui = mountTestApp();

    ui.submit('  ', '2026-01-15T09:00');
    ui.submit('Buy milk', '2026-01-15T09:00');

    const error = ui.q<HTMLParagraphElement>('#task-title-error');
    expect(error.hidden).toBe(true);
    expect(ui.title.hasAttribute('aria-invalid')).toBe(false);
    expect(ui.titles()).toEqual(['Buy milk']);
  });
});
