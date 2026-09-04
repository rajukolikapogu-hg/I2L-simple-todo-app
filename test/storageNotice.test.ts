import { beforeEach, describe, expect, it } from 'vitest';
import axe from 'axe-core';
import { TaskStore } from '../src/domain/taskStore';
import { TaskStorage } from '../src/storage/taskStorage';
import { MemoryStorage } from '../src/storage/safeStorage';
import { mountApp } from '../src/ui/app';
import { NO_STORAGE_NOTICE, STORAGE_NOTICE } from '../src/ui/storageNotice';
import { mountTestApp } from './helpers/mountApp';

function mountWith(persistent: boolean): HTMLElement {
  const root = document.createElement('div');
  document.body.replaceChildren(root);
  mountApp(root, new TaskStore(new TaskStorage(new MemoryStorage())), { persistent });
  return root;
}

describe('the storage notice', () => {
  beforeEach(() => document.body.replaceChildren());

  it('warns that clearing browser data erases tasks', () => {
    const ui = mountTestApp();

    const notice = ui.q<HTMLParagraphElement>('.notice');
    expect(notice.textContent).toBe(STORAGE_NOTICE);
    expect(notice.textContent).toMatch(/clearing your browsing data/i);
    expect(notice.textContent).toMatch(/erase/i);
  });

  it('is exposed to assistive technology as a note, not an alert', () => {
    const ui = mountTestApp();
    const notice = ui.q<HTMLParagraphElement>('.notice');

    // The text is present from first paint and never changes, so it should not
    // interrupt the user the way a live region would.
    expect(notice.getAttribute('role')).toBe('note');
    expect(notice.hasAttribute('aria-live')).toBe(false);
    expect(notice.hidden).toBe(false);
  });

  it('sits after the list, so it never comes between the user and the form', () => {
    const ui = mountTestApp();

    const children = [...ui.q('main.app').children];
    const noticeIndex = children.findIndex((el) => el.classList.contains('notice'));
    const formIndex = children.findIndex((el) => el.tagName === 'FORM');
    const listIndex = children.findIndex((el) => el.classList.contains('task-list'));

    expect(noticeIndex).toBeGreaterThan(formIndex);
    expect(noticeIndex).toBeGreaterThan(listIndex);
  });

  it('does not obstruct the create form or the task controls', () => {
    const ui = mountTestApp();
    ui.submit('Buy milk', '2026-01-15');

    // The notice is a sibling, not a wrapper or an overlay over the controls.
    const notice = ui.q<HTMLParagraphElement>('.notice');
    expect(notice.contains(ui.form)).toBe(false);
    expect(notice.querySelector('button')).toBeNull();
    expect(ui.titles()).toEqual(['Buy milk']);
  });

  it('says something stronger when storage is not working at all', () => {
    const root = mountWith(false);

    const notice = root.querySelector<HTMLParagraphElement>('.notice')!;
    expect(notice.textContent).toBe(NO_STORAGE_NOTICE);
    expect(notice.classList.contains('notice--warning')).toBe(true);
  });

  it('introduces no accessibility violations', async () => {
    const root = mountWith(true);

    const results = await axe.run(root, {
      runOnly: { type: 'rule', values: ['aria-roles', 'aria-valid-attr-value', 'label'] },
    });
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
