# Keyboard reference

Every action in the app is reachable and operable without a mouse.

## Tab order

Tab moves through the page in reading order:

1. **Task** title input
2. **Due date** input
3. **Add task** button
4. For each task in the list, in due-date order:
   1. completion checkbox
   2. **Edit date** button
   3. **Delete** button

Hidden controls — the date editor before it is opened, the delete confirmation
before it is requested — are removed from the tab order via the `hidden`
attribute, so Tab never lands on something the user cannot see.

## Keys

| Key | Where | Does |
| --- | --- | --- |
| `Enter` | Task title / due date input | Submits the form and adds the task |
| `Space` | Completion checkbox | Toggles the task complete or incomplete |
| `Enter` / `Space` | Any button | Activates it |
| `Enter` | Due-date editor | Saves the new date |
| `Escape` | Due-date editor | Cancels the edit and restores the previous date |

Buttons are real `<button>` elements and the toggle is a real
`<input type="checkbox">`, so `Enter`/`Space` activation comes from the platform
rather than from hand-written key handlers that would have to be kept correct.

## Focus movement

Focus is moved deliberately wherever the DOM changes under the user:

- After a task is added, focus returns to the title input, ready for the next one.
- If validation fails, focus moves to the first field that failed.
- Opening the due-date editor focuses the date input; saving or cancelling
  returns focus to the **Edit date** button — and when a saved date re-sorts the
  list, focus follows the task to its new position.
- Requesting a delete focuses the confirmation's **Delete** button; cancelling
  returns focus to the row's **Delete** button.

## Focus indicators

Every interactive element shows a 3px outline in the accent colour when focused.
`:focus-visible` keeps the ring off for mouse clicks while always showing it for
keyboard users, with a `:focus` fallback for browsers that lack it.
