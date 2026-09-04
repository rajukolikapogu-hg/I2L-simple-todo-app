import { describe, expect, it } from 'vitest';
import { createTask, isIsoDate, isTask } from '../src/domain/task';

describe('Task model', () => {
  it('creates a task with an id, timestamp and incomplete status', () => {
    const task = createTask({ title: 'Buy milk', dueDate: '2026-01-15' });

    expect(task.title).toBe('Buy milk');
    expect(task.dueDate).toBe('2026-01-15');
    expect(task.completed).toBe(false);
    expect(task.id).not.toHaveLength(0);
    expect(Number.isNaN(Date.parse(task.createdAt))).toBe(false);
  });

  it('gives each created task a unique id', () => {
    const ids = new Set(
      Array.from({ length: 50 }, () =>
        createTask({ title: 't', dueDate: '2026-01-15' }).id,
      ),
    );

    expect(ids.size).toBe(50);
  });

  it('accepts ISO calendar dates and rejects everything else', () => {
    expect(isIsoDate('2026-01-15')).toBe(true);
    expect(isIsoDate('2026-02-31')).toBe(false);
    expect(isIsoDate('15/01/2026')).toBe(false);
    expect(isIsoDate('')).toBe(false);
    expect(isIsoDate(null)).toBe(false);
  });

  it('narrows well-formed objects to Task and rejects malformed ones', () => {
    const task = createTask({ title: 'Ship it', dueDate: '2026-03-01' });

    expect(isTask(task)).toBe(true);
    expect(isTask({ ...task, dueDate: 'not-a-date' })).toBe(false);
    expect(isTask({ ...task, completed: 'yes' })).toBe(false);
    expect(isTask(null)).toBe(false);
  });
});
