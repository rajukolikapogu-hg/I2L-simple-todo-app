import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// The path goes through a variable: Vite rewrites a *literal*
// `new URL('...', import.meta.url)` into an asset URL, which is not a file path.
const read = (relative: string): string =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

const css = read('../src/styles.css');

/**
 * jsdom does not run animations, so what is worth checking is the contract
 * around them: that the decorative motion exists, and that a user who has asked
 * their system for less of it gets none.
 */
describe('motion', () => {
  it('animates the ambient background behind the page', () => {
    expect(css).toMatch(/@keyframes ambient-drift/);
    expect(css).toMatch(/body::before\s*\{[^}]*animation:\s*ambient-drift/);
  });

  it('moves the background with a transform so it composites off the main thread', () => {
    expect(css).toMatch(/@keyframes ambient-drift\s*\{[\s\S]*?translate3d/);
  });

  it('honours a reduced-motion preference', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');

    const block = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(block).toMatch(/animation:\s*none/);
    expect(block).toMatch(/transition:\s*none/);
    expect(block).toMatch(/transform:\s*none/);
  });

  it('keeps the ambient layer clear of pointer events', () => {
    expect(css).toMatch(/body::before\s*\{[^}]*pointer-events:\s*none/);
  });
});
