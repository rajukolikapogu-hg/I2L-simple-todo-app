# Acceptance Criteria

Simple Todo App

**Requirements covered:** 28/28
**Acceptance criteria:** 42

## Traceability

| Requirement | Module | Priority | Stories | Criteria |
| --- | --- | --- | --- | --- |
| CREATE-1 | Task Creation | Must | S1 create-1-as-a-user-i-want-to-create-a-task-with-a-title-and-due-date-so-that-i- | 4 |
| CREATE-2 | Task Creation | Must | S1 create-2-as-a-user-i-want-blank-title-task-creation-blocked-with-a-clear-messag | 2 |
| CREATE-3 | Task Creation | Must | S1 create-1-as-a-user-i-want-to-create-a-task-with-a-title-and-due-date-so-that-i- | 4 |
| CREATE-4 | Task Creation | Must | S1 create-1-as-a-user-i-want-to-create-a-task-with-a-title-and-due-date-so-that-i- | 4 |
| CREATE-5 | Task Creation | Should | S1 create-1-as-a-user-i-want-to-create-a-task-with-a-title-and-due-date-so-that-i- | 4 |
| DUE-1 | Due Date Management | Must | S2 due-1-as-a-user-i-want-to-change-the-due-date-of-an-existing-task-so-that-i-<br>S2 due-1-as-a-user-i-want-the-app-deployed-to-a-public-https-host-so-that-i-can | 6 |
| DUE-2 | Due Date Management | Must | S2 due-2-as-a-user-i-want-the-task-list-to-re-order-itself-after-i-change-a-due | 2 |
| DUE-3 | Due Date Management | Must | S2 due-1-as-a-user-i-want-to-change-the-due-date-of-an-existing-task-so-that-i- | 3 |
| DUE-4 | Due Date Management | Must | S2 due-1-as-a-user-i-want-to-change-the-due-date-of-an-existing-task-so-that-i- | 3 |
| DONE-1 | Completion Status | Must | S1 done-1-as-a-user-i-want-to-tick-a-task-off-and-un-tick-it-so-that-i-can-track | 3 |
| DONE-2 | Completion Status | Must | S1 done-1-as-a-user-i-want-to-tick-a-task-off-and-un-tick-it-so-that-i-can-track | 3 |
| DONE-3 | Completion Status | Must | S1 done-1-as-a-user-i-want-to-tick-a-task-off-and-un-tick-it-so-that-i-can-track | 3 |
| DONE-4 | Completion Status | Must | S1 done-1-as-a-user-i-want-to-tick-a-task-off-and-un-tick-it-so-that-i-can-track | 3 |
| DEL-1 | Task Deletion | Must | S1 del-1-as-a-user-i-want-to-delete-tasks-so-that-i-can-remove-things-i-no-long | 4 |
| DEL-2 | Task Deletion | Must | S1 del-1-as-a-user-i-want-to-delete-tasks-so-that-i-can-remove-things-i-no-long | 4 |
| DEL-3 | Task Deletion | Must | S1 del-1-as-a-user-i-want-to-delete-tasks-so-that-i-can-remove-things-i-no-long | 4 |
| DEL-4 | Task Deletion | Could | S1 del-1-as-a-user-i-want-to-delete-tasks-so-that-i-can-remove-things-i-no-long | 4 |
| LIST-1 | List View & Sorting | Must | S1 list-1-as-a-user-i-want-all-my-tasks-in-one-list-sorted-by-due-date-so-that-i | 4 |
| LIST-2 | List View & Sorting | Must | S1 list-1-as-a-user-i-want-all-my-tasks-in-one-list-sorted-by-due-date-so-that-i | 4 |
| LIST-3 | List View & Sorting | Must | S1 list-1-as-a-user-i-want-all-my-tasks-in-one-list-sorted-by-due-date-so-that-i | 4 |
| LIST-4 | List View & Sorting | Should | S1 list-1-as-a-user-i-want-all-my-tasks-in-one-list-sorted-by-due-date-so-that-i | 4 |
| STORE-1 | Local Storage Persistence | Must | S1 store-1-as-a-user-i-want-my-tasks-saved-to-and-loaded-from-browser-storage-so- | 3 |
| STORE-2 | Local Storage Persistence | Must | S1 store-1-as-a-user-i-want-my-tasks-saved-to-and-loaded-from-browser-storage-so- | 3 |
| STORE-3 | Local Storage Persistence | Must | S1 store-3-as-a-user-i-want-the-app-to-load-into-a-clean-usable-state-when-storag | 3 |
| STORE-4 | Local Storage Persistence | Should | S1 store-4-as-a-user-i-want-the-app-project-scaffolded-and-a-task-model-defined-s<br>S1 store-1-as-a-user-i-want-my-tasks-saved-to-and-loaded-from-browser-storage-so- | 6 |
| UI-1 | Accessibility & UI Shell | Should | S2 ui-1-as-a-user-i-want-to-operate-all-core-actions-with-the-keyboard-so-that | 2 |
| UI-2 | Accessibility & UI Shell | Should | S2 ui-2-as-a-user-i-want-form-controls-and-toggles-to-have-accessible-names-so<br>S2 ui-2-as-a-user-i-want-an-in-app-notice-warning-that-clearing-browser-data-e | 4 |
| UI-3 | Accessibility & UI Shell | Should | S2 ui-3-as-a-user-i-want-the-layout-to-remain-usable-on-both-phone-and-desktop<br>S2 due-1-as-a-user-i-want-the-app-deployed-to-a-public-https-host-so-that-i-can | 5 |

## Criteria by requirement

### CREATE-1 — The system shall allow the user to create a task with a title and a due date.

**create-1-as-a-user-i-want-to-create-a-task-with-a-title-and-due-date-so-that-i-** (Sprint 1) — As a User, I want to create a task with a title and due date so that I can capture things I need to do

- Creating a task with a title and due date adds it to the list and to localStorage
- The new task appears in the list in correct due-date order without a page reload
- Each created task has a unique id and a creation timestamp
- After a successful creation the input fields are cleared and focus returns to the title field

### CREATE-2 — The system shall reject creation of a task with an empty title and show a validation message.

**create-2-as-a-user-i-want-blank-title-task-creation-blocked-with-a-clear-messag** (Sprint 1) — As a User, I want blank-title task creation blocked with a clear message so that I don't accidentally create empty tasks

- Attempting to add a task with a blank title is blocked with a clear message
- No task is added to the list or localStorage when the title is blank

### CREATE-3 — The system shall assign a unique identifier and creation timestamp to each new task.

**create-1-as-a-user-i-want-to-create-a-task-with-a-title-and-due-date-so-that-i-** (Sprint 1) — As a User, I want to create a task with a title and due date so that I can capture things I need to do

- Creating a task with a title and due date adds it to the list and to localStorage
- The new task appears in the list in correct due-date order without a page reload
- Each created task has a unique id and a creation timestamp
- After a successful creation the input fields are cleared and focus returns to the title field

### CREATE-4 — The system shall persist a newly created task to local storage immediately upon creation.

**create-1-as-a-user-i-want-to-create-a-task-with-a-title-and-due-date-so-that-i-** (Sprint 1) — As a User, I want to create a task with a title and due date so that I can capture things I need to do

- Creating a task with a title and due date adds it to the list and to localStorage
- The new task appears in the list in correct due-date order without a page reload
- Each created task has a unique id and a creation timestamp
- After a successful creation the input fields are cleared and focus returns to the title field

### CREATE-5 — The system shall clear the input fields and return focus to the title field after a successful creation.

**create-1-as-a-user-i-want-to-create-a-task-with-a-title-and-due-date-so-that-i-** (Sprint 1) — As a User, I want to create a task with a title and due date so that I can capture things I need to do

- Creating a task with a title and due date adds it to the list and to localStorage
- The new task appears in the list in correct due-date order without a page reload
- Each created task has a unique id and a creation timestamp
- After a successful creation the input fields are cleared and focus returns to the title field

### DUE-1 — The system shall allow the user to change the due date of an existing task.

**due-1-as-a-user-i-want-to-change-the-due-date-of-an-existing-task-so-that-i-** (Sprint 2) — As a User, I want to change the due date of an existing task so that I can keep my schedule accurate as plans shift

- Editing a task's due date updates the displayed date
- An invalid or empty edited date is rejected and the prior value is retained
- The changed due date survives a page reload

**due-1-as-a-user-i-want-the-app-deployed-to-a-public-https-host-so-that-i-can** (Sprint 2) — As a User, I want the app deployed to a public HTTPS host so that I can access it from anywhere

- The app is live on a public static host over HTTPS
- The app loads correctly for a first-time visitor
- Core flows pass QA across major desktop and mobile browsers

### DUE-2 — The system shall re-sort the task list by due date (soonest first) immediately after a due date is changed.

**due-2-as-a-user-i-want-the-task-list-to-re-order-itself-after-i-change-a-due** (Sprint 2) — As a User, I want the task list to re-order itself after I change a due date so that the soonest tasks always appear first

- Editing a task's due date re-orders the list correctly with soonest first
- The re-ordered list state survives a page reload

### DUE-3 — The system shall validate that an edited due date is a valid date before saving.

**due-1-as-a-user-i-want-to-change-the-due-date-of-an-existing-task-so-that-i-** (Sprint 2) — As a User, I want to change the due date of an existing task so that I can keep my schedule accurate as plans shift

- Editing a task's due date updates the displayed date
- An invalid or empty edited date is rejected and the prior value is retained
- The changed due date survives a page reload

### DUE-4 — The system shall persist an edited due date to local storage upon save.

**due-1-as-a-user-i-want-to-change-the-due-date-of-an-existing-task-so-that-i-** (Sprint 2) — As a User, I want to change the due date of an existing task so that I can keep my schedule accurate as plans shift

- Editing a task's due date updates the displayed date
- An invalid or empty edited date is rejected and the prior value is retained
- The changed due date survives a page reload

### DONE-1 — The system shall allow the user to mark a task as completed.

**done-1-as-a-user-i-want-to-tick-a-task-off-and-un-tick-it-so-that-i-can-track** (Sprint 1) — As a User, I want to tick a task off and un-tick it so that I can track what I've completed

- Toggling completion applies strikethrough and keeps the task in the list
- Un-completing a task removes the strikethrough and restores normal styling
- Completion status persists across a page reload

### DONE-2 — The system shall allow the user to revert a completed task back to incomplete.

**done-1-as-a-user-i-want-to-tick-a-task-off-and-un-tick-it-so-that-i-can-track** (Sprint 1) — As a User, I want to tick a task off and un-tick it so that I can track what I've completed

- Toggling completion applies strikethrough and keeps the task in the list
- Un-completing a task removes the strikethrough and restores normal styling
- Completion status persists across a page reload

### DONE-3 — The system shall visually distinguish completed tasks (e.g., strikethrough) while keeping them visible in the list.

**done-1-as-a-user-i-want-to-tick-a-task-off-and-un-tick-it-so-that-i-can-track** (Sprint 1) — As a User, I want to tick a task off and un-tick it so that I can track what I've completed

- Toggling completion applies strikethrough and keeps the task in the list
- Un-completing a task removes the strikethrough and restores normal styling
- Completion status persists across a page reload

### DONE-4 — The system shall persist a task's completion status to local storage.

**done-1-as-a-user-i-want-to-tick-a-task-off-and-un-tick-it-so-that-i-can-track** (Sprint 1) — As a User, I want to tick a task off and un-tick it so that I can track what I've completed

- Toggling completion applies strikethrough and keeps the task in the list
- Un-completing a task removes the strikethrough and restores normal styling
- Completion status persists across a page reload

### DEL-1 — The system shall allow the user to delete any task from the list.

**del-1-as-a-user-i-want-to-delete-tasks-so-that-i-can-remove-things-i-no-long** (Sprint 1) — As a User, I want to delete tasks so that I can remove things I no longer need

- Deleting a task removes it from both the list and localStorage
- A deleted task does not reappear after a page reload
- Deletion works identically for completed and incomplete tasks
- A lightweight confirmation is shown before a task is permanently deleted

### DEL-2 — The system shall remove a deleted task from local storage immediately.

**del-1-as-a-user-i-want-to-delete-tasks-so-that-i-can-remove-things-i-no-long** (Sprint 1) — As a User, I want to delete tasks so that I can remove things I no longer need

- Deleting a task removes it from both the list and localStorage
- A deleted task does not reappear after a page reload
- Deletion works identically for completed and incomplete tasks
- A lightweight confirmation is shown before a task is permanently deleted

### DEL-3 — The system shall update the rendered list immediately after a deletion without a page reload.

**del-1-as-a-user-i-want-to-delete-tasks-so-that-i-can-remove-things-i-no-long** (Sprint 1) — As a User, I want to delete tasks so that I can remove things I no longer need

- Deleting a task removes it from both the list and localStorage
- A deleted task does not reappear after a page reload
- Deletion works identically for completed and incomplete tasks
- A lightweight confirmation is shown before a task is permanently deleted

### DEL-4 — The system should prompt a lightweight confirmation before permanent deletion.

**del-1-as-a-user-i-want-to-delete-tasks-so-that-i-can-remove-things-i-no-long** (Sprint 1) — As a User, I want to delete tasks so that I can remove things I no longer need

- Deleting a task removes it from both the list and localStorage
- A deleted task does not reappear after a page reload
- Deletion works identically for completed and incomplete tasks
- A lightweight confirmation is shown before a task is permanently deleted

### LIST-1 — The system shall display all tasks in a single plain list sorted by due date, soonest first.

**list-1-as-a-user-i-want-all-my-tasks-in-one-list-sorted-by-due-date-so-that-i** (Sprint 1) — As a User, I want all my tasks in one list sorted by due date so that I can see what's coming up first

- Tasks always appear in ascending due-date order regardless of the order they were created
- Completed tasks appear inline within the sorted list, visually distinguished
- The list re-sorts and re-renders whenever a task is added, completed, or deleted
- With no tasks, a friendly empty-state message is shown instead of a blank area

### LIST-2 — The system shall keep completed tasks in the same list rather than in a separate section.

**list-1-as-a-user-i-want-all-my-tasks-in-one-list-sorted-by-due-date-so-that-i** (Sprint 1) — As a User, I want all my tasks in one list sorted by due date so that I can see what's coming up first

- Tasks always appear in ascending due-date order regardless of the order they were created
- Completed tasks appear inline within the sorted list, visually distinguished
- The list re-sorts and re-renders whenever a task is added, completed, or deleted
- With no tasks, a friendly empty-state message is shown instead of a blank area

### LIST-3 — The system shall re-sort and re-render the list whenever a task is added, edited, completed, or deleted.

**list-1-as-a-user-i-want-all-my-tasks-in-one-list-sorted-by-due-date-so-that-i** (Sprint 1) — As a User, I want all my tasks in one list sorted by due date so that I can see what's coming up first

- Tasks always appear in ascending due-date order regardless of the order they were created
- Completed tasks appear inline within the sorted list, visually distinguished
- The list re-sorts and re-renders whenever a task is added, completed, or deleted
- With no tasks, a friendly empty-state message is shown instead of a blank area

### LIST-4 — The system shall display a friendly empty-state message when there are no tasks.

**list-1-as-a-user-i-want-all-my-tasks-in-one-list-sorted-by-due-date-so-that-i** (Sprint 1) — As a User, I want all my tasks in one list sorted by due date so that I can see what's coming up first

- Tasks always appear in ascending due-date order regardless of the order they were created
- Completed tasks appear inline within the sorted list, visually distinguished
- The list re-sorts and re-renders whenever a task is added, completed, or deleted
- With no tasks, a friendly empty-state message is shown instead of a blank area

### STORE-1 — The system shall persist the complete task collection to browser local storage whenever it changes.

**store-1-as-a-user-i-want-my-tasks-saved-to-and-loaded-from-browser-storage-so-** (Sprint 1) — As a User, I want my tasks saved to and loaded from browser storage so that they survive closing and reopening the browser tab

- Tasks created in one session are present after closing and reopening the browser tab
- All task mutations are reflected in localStorage immediately
- Data is stored under a single versioned key

### STORE-2 — The system shall load tasks fresh from local storage on each page load.

**store-1-as-a-user-i-want-my-tasks-saved-to-and-loaded-from-browser-storage-so-** (Sprint 1) — As a User, I want my tasks saved to and loaded from browser storage so that they survive closing and reopening the browser tab

- Tasks created in one session are present after closing and reopening the browser tab
- All task mutations are reflected in localStorage immediately
- Data is stored under a single versioned key

### STORE-3 — The system shall load into an empty, usable state if local storage is unavailable or its contents are corrupt.

**store-3-as-a-user-i-want-the-app-to-load-into-a-clean-usable-state-when-storag** (Sprint 1) — As a User, I want the app to load into a clean, usable state when storage is missing or corrupt so that it never crashes on startup

- Corrupt or malformed storage contents do not crash the app; it loads empty
- The app is fully usable after loading from an empty or invalid storage state
- No uncaught errors occur when localStorage is unavailable

### STORE-4 — The system shall store data under a single versioned key to allow future schema handling.

**store-4-as-a-user-i-want-the-app-project-scaffolded-and-a-task-model-defined-s** (Sprint 1) — As a User, I want the app project scaffolded and a Task model defined so that development can proceed on a stable, testable foundation

- The project builds and runs locally via a single command and produces a deployable static bundle
- Linting, formatting, and the test harness run successfully with a sample passing test
- A Task type is defined exposing id, title, due date, completion status, and creation timestamp

**store-1-as-a-user-i-want-my-tasks-saved-to-and-loaded-from-browser-storage-so-** (Sprint 1) — As a User, I want my tasks saved to and loaded from browser storage so that they survive closing and reopening the browser tab

- Tasks created in one session are present after closing and reopening the browser tab
- All task mutations are reflected in localStorage immediately
- Data is stored under a single versioned key

### UI-1 — The system shall be operable via keyboard for all core actions (create, complete, edit, delete).

**ui-1-as-a-user-i-want-to-operate-all-core-actions-with-the-keyboard-so-that** (Sprint 2) — As a User, I want to operate all core actions with the keyboard so that I can use the app without a mouse

- All primary actions (create, complete, edit, delete) can be completed using only the keyboard
- Every interactive element receives a visible focus indicator when tabbed to

### UI-2 — The system shall provide accessible labels for all form controls and interactive elements.

**ui-2-as-a-user-i-want-form-controls-and-toggles-to-have-accessible-names-so** (Sprint 2) — As a User, I want form controls and toggles to have accessible names so that assistive technology can describe them to me

- Form inputs and toggles expose accessible names to assistive technology
- An automated accessibility audit reports no missing-label violations

**ui-2-as-a-user-i-want-an-in-app-notice-warning-that-clearing-browser-data-e** (Sprint 2) — As a User, I want an in-app notice warning that clearing browser data erases tasks so that I understand the storage limitation

- An in-app notice informs the user that clearing browser data will erase tasks
- The notice is exposed to assistive technology

### UI-3 — The system shall render a usable layout across desktop and mobile browser viewports.

**ui-3-as-a-user-i-want-the-layout-to-remain-usable-on-both-phone-and-desktop** (Sprint 2) — As a User, I want the layout to remain usable on both phone and desktop so that I can manage tasks on any device

- The layout remains usable at both mobile and desktop widths
- No content is clipped or overlapping at a 320px-wide viewport

**due-1-as-a-user-i-want-the-app-deployed-to-a-public-https-host-so-that-i-can** (Sprint 2) — As a User, I want the app deployed to a public HTTPS host so that I can access it from anywhere

- The app is live on a public static host over HTTPS
- The app loads correctly for a first-time visitor
- Core flows pass QA across major desktop and mobile browsers

