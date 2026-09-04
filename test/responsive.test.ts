import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it } from 'vitest';
import { mountTestApp } from './helpers/mountApp';

const read = (relative: string): string =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

const css = read('../src/styles.css');
const html = read('../index.html');

/**
 * jsdom has no layout engine, so "does this overlap at 320px?" cannot be
 * answered here — that is what the cross-browser QA pass is for. What *can* be
 * checked automatically is the set of rules that make overflow possible in the
 * first place, which is where regressions actually creep in.
 */
describe('responsive layout', () => {
  beforeEach(() => document.body.replaceChildren());

  it('opts into the device viewport rather than a desktop-width one', () => {
    expect(html).toContain('name="viewport"');
    expect(html).toContain('width=device-width');
    expect(html).toContain('initial-scale=1');
  });

  it('declares no fixed width that could exceed a 320px viewport', () => {
    const widths = [...css.matchAll(/\b(?:min-width|width)\s*:\s*(\d+)px/g)]
      .map((match) => Number(match[1]))
      .filter((value) => value > 320);

    expect(widths).toEqual([]);
  });

  it('constrains the page with a max-width rather than a fixed width', () => {
    expect(css).toMatch(/\.app\s*\{[^}]*max-width:/);
    expect(css).not.toMatch(/\.app\s*\{[^}]*[^-]width:\s*\d/);
  });

  it('lets the form and task rows wrap instead of overflowing', () => {
    expect(css).toMatch(/\.task-form\s*\{[^}]*flex-wrap:\s*wrap/);
    expect(css).toMatch(/\.task\s*\{[^}]*flex-wrap:\s*wrap/);
  });

  it('breaks long words in a title so one cannot widen the page', () => {
    expect(css).toMatch(/\.task__title\s*\{[^}]*overflow-wrap:\s*anywhere/);
    expect(css).toMatch(/overflow-x:\s*hidden/);
  });

  it('stacks the layout at narrow widths', () => {
    expect(css).toContain('@media (max-width: 30rem)');
    expect(css).toMatch(/@media \(max-width: 30rem\)[\s\S]*flex-direction:\s*column/);
  });

  it('keeps touch targets tappable on coarse pointers', () => {
    expect(css).toContain('@media (pointer: coarse)');
    expect(css).toMatch(/@media \(pointer: coarse\)[\s\S]*min-height:\s*44px/);
  });

  it('renders a very long title as one wrappable element, not a wide one', () => {
    const ui = mountTestApp();
    const longTitle = 'Supercalifragilisticexpialidocious'.repeat(6);
    ui.submit(longTitle, '2026-01-15');

    const title = ui.q<HTMLSpanElement>('.task__title');
    // A single text node with no nested structure, so nothing inside it can
    // establish a minimum width that the wrapping rules cannot break.
    expect(title.children).toHaveLength(0);
    expect(title.textContent).toBe(longTitle);
  });
});
