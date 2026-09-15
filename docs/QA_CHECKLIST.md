# Cross-browser QA checklist

Run before each release, against the deployed HTTPS URL rather than the dev
server, so the checks cover the real bundle and real storage origin.

## Browsers

| Browser | Platform | Why it earns a pass of its own                             |
| ------- | -------- | ---------------------------------------------------------- |
| Chrome  | Desktop  | Largest share; the baseline                                |
| Firefox | Desktop  | Independent engine; differs on date inputs and focus rings |
| Safari  | macOS    | Only engine on iOS; strictest storage behaviour            |
| Safari  | iOS      | `<input type="date">` renders as a native wheel picker     |
| Chrome  | Android  | Touch targets and the on-screen keyboard                   |

## Core flows

Run each in every browser above.

- [ ] **First visit** — app loads with the empty-state message and no console errors
- [ ] **Create** — title + due date and time adds the task in the right position, showing its date and time
- [ ] **Blank title** — rejected with a visible message; nothing added
- [ ] **Complete** — strikethrough applied, task stays in place
- [ ] **Un-complete** — normal styling restored
- [ ] **Edit due date** — new date and time shown, list re-orders immediately (including by time on the same day)
- [ ] **Invalid due date** — rejected, prior value retained
- [ ] **Delete** — confirmation shown first, then task removed
- [ ] **Cancel delete** — task kept
- [ ] **Reload** — every change above survives

## Storage

- [ ] Tasks survive closing and reopening the tab
- [ ] Tasks survive a full browser restart
- [ ] Private / incognito window: app loads and is usable; the "not saving data"
      notice appears if the browser blocks storage
- [ ] With site data cleared, the app loads empty rather than erroring
- [ ] With a corrupt value written manually to the `i2l-todo:v1` key, the app
      loads empty and stays usable

## Layout

- [ ] 320px wide — no horizontal scrolling, nothing clipped or overlapping
- [ ] 375px (typical phone) — controls stacked and comfortably tappable
- [ ] 768px (tablet) and 1440px (desktop) — content centred, line lengths sane
- [ ] A very long single-word title wraps instead of widening the page
- [ ] Dark mode — the app follows the OS setting and stays readable

## Accessibility

- [ ] Full lifecycle — create, complete, edit, delete — with the keyboard only
- [ ] Every focused element shows a visible focus ring
- [ ] Focus is never left on a hidden control after the editor or the delete
      confirmation opens or closes
- [ ] Screen reader announces each control with the task it belongs to
- [ ] The storage notice is reachable and announced
