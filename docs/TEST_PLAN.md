# Test Plan

Simple Todo App

QA strategy for a client-only, zero-backend single-page Todo app whose data lives entirely in browser localStorage. Testing centers on two fragile axes the TDD itself flags: the correctness of pure domain logic (CRUD, due-date sorting, validation) and the resilience of the single localStorage adapter under missing, quota-exceeded, and corrupt-data conditions. Because there is no server, no accounts, and no external integrations, the suite is dominated by fast unit and component-integration tests, backstopped by real-browser end-to-end checks for persistence across reloads and manual passes for accessibility and cross-browser/device behavior.

## Strategy

The product's architecture drives the strategy: three isolated layers (pure domain, thin localStorage adapter, presentation) mean the bulk of risk is provable without a browser. Domain logic — task CRUD, due-date ascending sort with a to-be-decided tiebreaker, title/date validation — is pure and gets exhaustive unit coverage in Vitest. The single point of environmental coupling, the localStorage adapter, gets dedicated integration tests that simulate the exact failure modes the TDD calls out: storage unavailable (private mode / disabled Web Storage), quota exceeded (~5MB), and malformed/corrupt JSON that must degrade to an empty usable state rather than crash. Component-integration tests (Testing Library) verify that mutations propagate through the domain layer to the adapter and re-render the list in correct order without a reload. Persistence-across-reload — the app's headline behavior and biggest data-loss risk — is verified end-to-end in real browsers where localStorage genuinely survives tab close/reopen, since jsdom does not faithfully model this. XSS via unescaped task titles is a low-but-real risk given free-text rendered to the DOM; a focused set of injection cases confirms framework escaping holds. Accessibility (keyboard operability, accessible names, responsive layout) needs human judgment and real assistive-tech/device checks and is planned as manual work supplemented by automated axe scans. AI agents draft implementation and tests; senior engineers review every diff, own the correctness of domain and adapter tests, and sign off on the manual accessibility and cross-browser passes. Automation is the default gate on every merge; manual effort is reserved only where tooling cannot judge (screen-reader experience, real-device layout, exploratory data-loss scenarios).

## Scope

**In scope**

- Task creation with title and due date, including empty-title validation and input clearing/refocus (CREATE-1..5)
- Due-date editing with immediate re-sort and persistence (DUE-1..4)
- Completion toggle, un-complete, inline strikethrough distinction, and persistence (DONE-1..4)
- Task deletion for both complete and incomplete tasks with immediate list and storage update, and optional confirmation (DEL-1..4)
- Single plain list rendered in ascending due-date order with completed tasks intermixed and an empty-state message (LIST-1..4)
- localStorage persistence: serialize on every change, hydrate fresh on load, versioned single key, and graceful fallback on missing/unavailable/corrupt data (STORE-1..4)
- Keyboard operability, accessible labels/names, and responsive layout across mobile and desktop viewports (UI-1..3)
- XSS-safety of user-entered task titles on render
- Cross-browser behavior of localStorage persistence across tab close/reopen

**Out of scope**

- Multi-user accounts, authentication, and role separation (excluded by design; single implicit User role)
- Cloud sync and cross-device access
- Any server-side backend, API, or database testing
- Reminders and notifications
- A separate completed-tasks section or hiding completed tasks
- Overdue visual highlighting
- Load/scale testing of a backend (none exists); performance testing beyond confirming trivial local sort/render for low-hundreds of tasks
- Recovery of data lost by users clearing browser data (accepted per PRD; only the in-app warning notice is tested)

## Test levels

| Level | Purpose | Tooling | Owner | Automation |
| --- | --- | --- | --- | --- |
| unit | Prove pure domain logic in isolation: task CRUD, due-date ascending sort and tiebreaker, unique id and createdAt assignment, and title/date validation. This is the highest-value, fastest layer given the DOM-independent domain design. | Vitest | Senior engineer reviewing AI-drafted domain tests | Fully automated; runs on every commit and blocks merge on failure |
| integration | Verify the localStorage adapter's serialize/hydrate cycle and its graceful degradation on missing, quota-exceeded, and corrupt-JSON storage; verify UI components wire through the domain layer to the adapter and re-render/re-sort without a page reload. | Vitest + Testing Library with mocked/stubbed localStorage and injected corrupt payloads | Senior engineer owning the persistence and presentation layers | Fully automated; runs in CI on every merge request |
| e2e | Confirm end-to-end persistence across real tab close/reopen and page reload in an actual browser (which jsdom cannot faithfully model), plus full user journeys: create -> complete -> edit due date -> delete, with correct live re-sorting. | Playwright against a real Chromium/Firefox/WebKit build | Senior engineer; cross-browser matrix reviewed at launch sprint | Automated; core journeys run in CI, full cross-browser matrix run as a launch gate |
| security | Confirm task titles containing script/HTML payloads are escaped on render and cannot execute (stored-XSS via task text), and that no unexpected data leaves the origin. | Playwright/Testing Library injection cases plus manual DevTools inspection | Senior engineer reviewing render/escaping path | Automated injection cases; one manual confirmation of escaping at launch |
| accessibility | Verify keyboard operability for all core actions, accessible names on form controls and toggles, and usable responsive layout — the parts requiring human and assistive-tech judgment (UI-1..3). | axe-core automated scans plus manual screen-reader and keyboard walkthroughs | Senior engineer with manual a11y pass; results reviewed before launch | Partially automated (axe scans in CI); keyboard flow and screen-reader experience are manual |
| manual | Exploratory data-loss/edge scenarios (private browsing, disabled storage, near-quota data), real-device responsive checks on phone and desktop, and cross-browser visual sanity that automation cannot judge. | Real devices and browsers; manual test charters | Senior engineer / QA reviewer | Manual by necessity; findings feed back into automated regression where reproducible |

## Environments

| Environment | Purpose | Data |
| --- | --- | --- |
| Local dev | AI agents and engineers run unit and integration suites against Vite dev/build; fastest feedback loop for domain and adapter logic. | Ephemeral in-memory and mocked localStorage fixtures; corrupt-JSON and quota-exceeded payloads injected per test |
| CI pipeline | Gate every merge: run full unit, integration, automated e2e core journeys, axe scans, and XSS injection cases on the built static bundle. | Seeded deterministic task fixtures and adversarial storage payloads; no persistent shared state between runs |
| Preview deploy (static host) | Per-branch static deploy (Netlify/Vercel/GitHub/Cloudflare Pages preview) for real-browser e2e, cross-browser matrix, manual accessibility, and real-device checks over HTTPS. | Real browser localStorage populated by test journeys; cleared between sessions to validate hydrate-from-empty |
| Production static host/CDN | Post-deploy smoke: confirm the live static bundle loads, hydrates, persists across reload, and serves over HTTPS. | Real user browser storage; smoke tests use disposable throwaway tasks only |

## Test data

- Model all fixtures on the Task/TaskCollection schema: id, title, dueDate (ISO string), completed, createdAt, plus schemaVersion on the collection.
- Maintain a canonical corrupt-storage fixture set: truncated JSON, wrong-typed fields, missing schemaVersion, and non-JSON garbage, to prove STORE-3 empty-state fallback.
- Include a quota/unavailable fixture: mock localStorage throwing on set (quota exceeded) and on access (disabled/private mode).
- Seed sort fixtures with out-of-order due dates, duplicate due dates (to exercise the tiebreaker once resolved), and mixed completed/incomplete tasks to prove inline ordering (LIST-1/LIST-2).
- Include XSS payload fixtures in task titles (e.g. script tags, HTML entities) to verify escaping on render.
- Keep datasets small but include a low-hundreds-of-tasks set to sanity-check render/sort performance and approach to the ~5MB storage bound.
- Never persist test data to the production origin; each e2e/manual session starts from cleared storage to also validate fresh hydrate.

## Entry criteria

- Approved TDD and numbered functional requirements are baselined and mapped to test levels.
- Project scaffolding (Vite + TypeScript, ESLint, Prettier, Vitest, Testing Library) is in place and CI runs the test suites.
- The four open technical questions with test impact are resolved or explicitly deferred: title-edit inclusion, delete confirmation, data-loss notice, and duplicate-due-date tiebreaker.
- Task/TaskCollection type definitions and the storage adapter interface are agreed so fixtures can be authored.
- Static preview deploy pipeline is available for real-browser testing.

## Exit criteria

- Every Must requirement (all CREATE/DUE/DONE/DEL/LIST/STORE Musts) has passing automated coverage at unit and/or integration level, reviewed and owned by a senior engineer.
- Persistence-across-reload and the full create/complete/edit/delete journey pass end-to-end in the agreed cross-browser matrix.
- STORE-3 graceful-degradation verified for missing, unavailable/private-mode, quota-exceeded, and corrupt-JSON storage — app loads into a usable empty state in all cases.
- XSS injection cases confirm task titles are escaped and cannot execute.
- Accessibility: automated axe scans clean of blocking violations, and manual keyboard + screen-reader passes confirm UI-1/UI-2/UI-3 with no unresolved critical findings.
- Data-loss in-app notice is present and verified (if confirmed in scope).
- No open defects rated critical or high; production smoke confirms HTTPS load, hydrate, and reload-persistence on the live CDN.

## Defect management

Defects are logged against the specific functional requirement ID and test level, with the reproducing fixture (especially the exact storage payload for adapter/corruption bugs) attached. Severity reflects this product's risk profile: Critical = app fails to load or crashes on corrupt/unavailable storage, or silent data loss on a mutation; High = a Must requirement broken (wrong sort order, mutation not persisted, completion/deletion not reflected) or an XSS escape failure; Medium = Should requirements (focus/clear on create, empty state, versioned key) or accessibility gaps; Low = cosmetic/polish. Since AI agents draft fixes and tests, every defect fix requires a senior-engineer-reviewed regression test at the lowest level that can catch it, added to the automated suite before the fix is accepted. Critical and High defects block their sprint's exit; XSS and data-loss-class defects block launch regardless of sprint.

## Risk areas

| Area | Risk | Mitigation |
| --- | --- | --- |
| Persistence / data loss | localStorage is the sole datastore; clearing browser data, private mode, or switching devices erases all tasks, and tests run in jsdom may falsely pass persistence that never survives a real reload. | Run persistence-across-reload and tab-reopen cases in real browsers on the preview deploy, not jsdom; verify the in-app data-loss warning notice is present and clear. |
| Storage adapter resilience | Unavailable, quota-exceeded, or corrupt localStorage could crash the app or wipe data instead of degrading gracefully (STORE-3). | Dedicated integration suite injecting throw-on-access, throw-on-set/quota, and malformed-JSON payloads, asserting the app hydrates into a usable empty state without crashing. |
| Sorting correctness | List must always be ascending by due date with completed tasks inline; the ordering of identical due dates is an unresolved open question and could produce non-deterministic, flaky results. | Resolve the tiebreaker (likely createdAt) before authoring sort tests; cover duplicate and out-of-order due dates and re-sort-on-every-mutation (LIST-3) explicitly. |
| Security (XSS) | Free-text task titles rendered to the DOM could execute injected script if escaping is bypassed. | Automated injection cases with script/HTML payloads asserting escaped rendering, plus a manual DevTools confirmation before launch. |
| Accessibility | Keyboard operability, accessible names, and responsive usability (UI-1..3) are Should-level and hard to verify with automation alone; regressions can slip past unit/integration tests. | Combine axe scans in CI with manual keyboard and screen-reader walkthroughs and real-device layout checks in the launch sprint. |
| Scope creep | Requests for sync, accounts, reminders, or overdue highlighting would introduce untested backend/complexity the PRD excludes and destabilize the plan. | Hold the test suite strictly to the in-scope requirement IDs; flag any test asking for excluded behavior back to the product owner rather than expanding coverage. |

## Sprint gates

### Sprint 1 — Foundations, the localStorage adapter, and core CRUD: unit-test pure domain logic (create, validation, id/timestamp, completion toggle, delete, ascending due-date sort) and integration-test the adapter's serialize/hydrate plus graceful degradation on missing/unavailable/corrupt storage. Real-browser e2e confirms tasks survive a page reload and the list renders sorted with completed tasks inline.

**Entry**

- Scaffolding, CI, Vitest and Testing Library operational
- Task/TaskCollection types and storage adapter interface agreed
- Duplicate-due-date tiebreaker decision available for sort tests
- Corrupt/unavailable/quota storage fixtures authored

**Exit**

- CREATE-1..4, DONE-1..4, DEL-1..3, LIST-1..3, STORE-1..3 have passing senior-reviewed automated coverage
- STORE-3 degradation verified for missing, unavailable, quota-exceeded, and corrupt-JSON storage
- Persistence-across-reload verified end-to-end in at least one real browser
- No open Critical or High defects; CREATE-5, LIST-4, STORE-4 covered or explicitly carried forward

### Sprint 2 — Due-date editing with live re-sort and persistence, full accessibility and responsive verification, XSS-safety confirmation, the data-loss notice, and cross-browser launch QA. Automated coverage for DUE requirements; manual accessibility and real-device passes; production smoke after deploy.

**Entry**

- Sprint 1 exit criteria met with no open Critical/High defects
- Delete-confirmation, title-edit, and data-loss-notice scope decisions resolved
- Preview static deploy available over HTTPS for cross-browser and real-device testing
- axe-core and Playwright cross-browser matrix configured

**Exit**

- DUE-1..4 pass with verified re-sort and reload persistence; DEL-4/title-edit covered if in scope
- UI-1..3 verified via automated axe scans plus manual keyboard and screen-reader passes with no critical a11y findings
- Responsive layout confirmed on real mobile and desktop across the agreed browser matrix
- XSS escaping confirmed; data-loss in-app notice present and verified
- Production deploy smoke passes (HTTPS load, hydrate, reload-persistence); no open Critical or High defects


## Test cases

50 case(s).

### Sprint 1

#### TC-001 — Project builds and runs via single command producing static bundle

`integration` · `high` · Requirements: STORE-4 · Stories: store-4-as-a-user-i-want-the-app-project-scaffolded-and-a-task-model-defined-s

**Preconditions**

- Repo cloned with dependencies installed

**Steps**

1. Run the documented single build/run command
2. Run the lint, format, and test harness commands

**Expected:** App builds and runs locally, a deployable static bundle is produced, and lint/format/test all pass including a sample passing test

#### TC-002 — Task model exposes required fields

`unit` · `high` · Requirements: CREATE-3, STORE-4 · Stories: store-4-as-a-user-i-want-the-app-project-scaffolded-and-a-task-model-defined-s

**Preconditions**

- Domain layer available

**Steps**

1. Construct a new Task via the domain factory with title and due date

**Expected:** Returned Task exposes id, title, due date, completion status, and creation timestamp fields

#### TC-003 — New task assigned unique id and creation timestamp

`unit` · `high` · Requirements: CREATE-3 · Stories: create-1-as-a-user-i-want-to-create-a-task-with-a-title-and-due-date-so-that-i-

**Preconditions**

- Domain layer available

**Steps**

1. Create two tasks in succession
2. Inspect their id and creation timestamp values

**Expected:** Each task has a distinct unique id and a valid creation timestamp set at creation time

#### TC-004 — Create task with title and due date

`unit` · `high` · Requirements: CREATE-1 · Stories: create-1-as-a-user-i-want-to-create-a-task-with-a-title-and-due-date-so-that-i-

**Preconditions**

- Empty task collection

**Steps**

1. Call create with a non-empty title and a valid due date

**Expected:** Task is added to the collection with the given title and due date

#### TC-005 — Reject creation with empty title and show validation message

`unit` · `high` · `negative` · Requirements: CREATE-2 · Stories: create-2-as-a-user-i-want-blank-title-task-creation-blocked-with-a-clear-messag

**Preconditions**

- Empty task collection

**Steps**

1. Call create with an empty or whitespace-only title

**Expected:** Creation is rejected, a validation error/message is returned, and no task is added

#### TC-006 — Blank-title creation shows message and adds nothing to list or storage

`integration` · `high` · `negative` · Requirements: CREATE-2 · Stories: create-2-as-a-user-i-want-blank-title-task-creation-blocked-with-a-clear-messag

**Preconditions**

- App rendered with empty list

**Steps**

1. Leave title empty, set a due date
2. Click Add

**Expected:** A clear validation message is shown, no task appears in the list, and localStorage is unchanged

#### TC-007 — Creating a task renders it and persists immediately

`integration` · `high` · Requirements: CREATE-1, CREATE-4, LIST-3 · Stories: create-1-as-a-user-i-want-to-create-a-task-with-a-title-and-due-date-so-that-i-, store-1-as-a-user-i-want-my-tasks-saved-to-and-loaded-from-browser-storage-so-

**Preconditions**

- App rendered with empty list

**Steps**

1. Enter a title and due date
2. Click Add
3. Inspect the rendered list and localStorage contents

**Expected:** The task appears in the list without reload and is written to localStorage immediately

#### TC-008 — Inputs clear and focus returns to title after creation

`integration` · `medium` · Requirements: CREATE-5 · Stories: create-1-as-a-user-i-want-to-create-a-task-with-a-title-and-due-date-so-that-i-

**Preconditions**

- App rendered

**Steps**

1. Enter title and due date
2. Click Add
3. Observe input fields and active element

**Expected:** Title and due-date inputs are cleared and keyboard focus is on the title field

#### TC-009 — Mark a task complete in domain

`unit` · `high` · Requirements: DONE-1 · Stories: done-1-as-a-user-i-want-to-tick-a-task-off-and-un-tick-it-so-that-i-can-track

**Preconditions**

- Collection with one incomplete task

**Steps**

1. Toggle the task's completion to complete

**Expected:** The task's completion status is true

#### TC-010 — Revert a completed task to incomplete in domain

`unit` · `high` · Requirements: DONE-2 · Stories: done-1-as-a-user-i-want-to-tick-a-task-off-and-un-tick-it-so-that-i-can-track

**Preconditions**

- Collection with one completed task

**Steps**

1. Toggle the task's completion back to incomplete

**Expected:** The task's completion status is false

#### TC-011 — Completed task shown with strikethrough and kept in list

`integration` · `high` · Requirements: DONE-3, LIST-2 · Stories: done-1-as-a-user-i-want-to-tick-a-task-off-and-un-tick-it-so-that-i-can-track, list-1-as-a-user-i-want-all-my-tasks-in-one-list-sorted-by-due-date-so-that-i

**Preconditions**

- App rendered with one task

**Steps**

1. Click the task's completion toggle
2. Observe styling and list membership
3. Toggle it back off

**Expected:** Completed task gets strikethrough styling and remains inline in the same list; un-completing restores normal styling

#### TC-012 — Completion toggle persisted to storage

`integration` · `high` · Requirements: DONE-4 · Stories: done-1-as-a-user-i-want-to-tick-a-task-off-and-un-tick-it-so-that-i-can-track

**Preconditions**

- App rendered with one task

**Steps**

1. Toggle the task complete
2. Inspect localStorage contents

**Expected:** The stored task's completion status reflects the new value immediately

#### TC-013 — Delete a task from domain collection

`unit` · `high` · Requirements: DEL-1 · Stories: del-1-as-a-user-i-want-to-delete-tasks-so-that-i-can-remove-things-i-no-long

**Preconditions**

- Collection with two tasks

**Steps**

1. Delete one task by id

**Expected:** Only the targeted task is removed; the other remains

#### TC-014 — Deletion removes task from list and storage immediately

`integration` · `high` · Requirements: DEL-2, DEL-3, LIST-3 · Stories: del-1-as-a-user-i-want-to-delete-tasks-so-that-i-can-remove-things-i-no-long

**Preconditions**

- App rendered with one task

**Steps**

1. Trigger delete on the task
2. Confirm the deletion prompt
3. Inspect list and localStorage

**Expected:** Task is removed from the rendered list without reload and removed from localStorage immediately

#### TC-015 — Lightweight confirmation shown before permanent deletion

`integration` · `medium` · `negative` · Requirements: DEL-4 · Stories: del-1-as-a-user-i-want-to-delete-tasks-so-that-i-can-remove-things-i-no-long

**Preconditions**

- App rendered with one task

**Steps**

1. Trigger delete on the task
2. Cancel the confirmation prompt
3. Observe the list

**Expected:** A confirmation is presented; cancelling leaves the task in place and in storage

#### TC-016 — Deletion works identically for completed tasks

`integration` · `medium` · Requirements: DEL-1, DEL-3 · Stories: del-1-as-a-user-i-want-to-delete-tasks-so-that-i-can-remove-things-i-no-long

**Preconditions**

- App rendered with one completed and one incomplete task

**Steps**

1. Delete the completed task and confirm
2. Delete the incomplete task and confirm

**Expected:** Both tasks are removed from list and storage regardless of completion state

#### TC-017 — Tasks sorted by due date ascending regardless of creation order

`unit` · `high` · Requirements: LIST-1 · Stories: list-1-as-a-user-i-want-all-my-tasks-in-one-list-sorted-by-due-date-so-that-i

**Preconditions**

- Collection with tasks having out-of-order due dates

**Steps**

1. Add tasks with due dates in non-sorted creation order
2. Request the sorted view

**Expected:** Tasks are returned in ascending due-date order, soonest first

#### TC-018 — List re-sorts and re-renders after mutations

`integration` · `high` · Requirements: LIST-3, LIST-1 · Stories: list-1-as-a-user-i-want-all-my-tasks-in-one-list-sorted-by-due-date-so-that-i

**Preconditions**

- App rendered with several tasks

**Steps**

1. Add a task with an earlier due date than existing ones
2. Observe list order
3. Delete a task and observe order

**Expected:** The list re-sorts and re-renders in correct due-date order after each add/complete/delete without reload

#### TC-019 — Friendly empty-state message when no tasks

`integration` · `medium` · Requirements: LIST-4 · Stories: list-1-as-a-user-i-want-all-my-tasks-in-one-list-sorted-by-due-date-so-that-i

**Preconditions**

- App rendered with empty collection

**Steps**

1. Load the app with no tasks
2. Observe the list area

**Expected:** A friendly empty-state message is displayed instead of a blank area

#### TC-020 — Collection persisted under single versioned key on change

`integration` · `high` · Requirements: STORE-1, STORE-4 · Stories: store-1-as-a-user-i-want-my-tasks-saved-to-and-loaded-from-browser-storage-so-

**Preconditions**

- Fresh localStorage

**Steps**

1. Create a task via the app
2. Enumerate localStorage keys and inspect the stored payload

**Expected:** The complete task collection is stored under exactly one versioned key and updated on every mutation

#### TC-021 — Tasks loaded fresh from storage on each page load

`integration` · `high` · Requirements: STORE-2 · Stories: store-1-as-a-user-i-want-my-tasks-saved-to-and-loaded-from-browser-storage-so-

**Preconditions**

- localStorage pre-seeded with a valid task collection

**Steps**

1. Initialize/mount the app
2. Inspect the rendered list

**Expected:** The app reads and renders the tasks present in localStorage at load time

#### TC-022 — Corrupt/malformed storage degrades to empty usable state

`integration` · `high` · `negative` · Requirements: STORE-3 · Stories: store-3-as-a-user-i-want-the-app-to-load-into-a-clean-usable-state-when-storag

**Preconditions**

- localStorage key set to malformed/non-JSON content

**Steps**

1. Initialize the app with corrupt storage contents
2. Attempt to create a new task

**Expected:** App loads into an empty state without crashing or uncaught errors and remains fully usable

#### TC-023 — Storage unavailable (disabled Web Storage) does not crash

`integration` · `high` · `negative` · Requirements: STORE-3 · Stories: store-3-as-a-user-i-want-the-app-to-load-into-a-clean-usable-state-when-storag

**Preconditions**

- localStorage access throws / is unavailable (private mode simulated)

**Steps**

1. Initialize the app with localStorage access disabled
2. Create and toggle a task in-session

**Expected:** No uncaught errors occur; app loads empty and stays usable for the session

#### TC-024 — Quota exceeded on write handled gracefully

`integration` · `medium` · `negative` · Requirements: STORE-1, STORE-3 · Stories: store-3-as-a-user-i-want-the-app-to-load-into-a-clean-usable-state-when-storag

**Preconditions**

- localStorage.setItem stubbed to throw QuotaExceededError

**Steps**

1. Attempt to create a task that triggers a write
2. Observe app behavior

**Expected:** The write failure is caught, no uncaught error crashes the app, and the app remains usable

#### TC-025 — Tasks survive tab close and reopen

`e2e` · `high` · Requirements: STORE-1, STORE-2 · Stories: store-1-as-a-user-i-want-my-tasks-saved-to-and-loaded-from-browser-storage-so-

**Preconditions**

- App deployed/served in a real browser

**Steps**

1. Create two tasks with due dates
2. Close the browser tab
3. Reopen the app URL in a new tab

**Expected:** Both tasks reappear in correct order with their titles, due dates, and completion states intact

#### TC-026 — Completion status and deletions persist across reload end-to-end

`e2e` · `high` · Requirements: DONE-4, DEL-2 · Stories: done-1-as-a-user-i-want-to-tick-a-task-off-and-un-tick-it-so-that-i-can-track, del-1-as-a-user-i-want-to-delete-tasks-so-that-i-can-remove-things-i-no-long

**Preconditions**

- App served in a real browser with several tasks

**Steps**

1. Complete one task and delete another
2. Reload the page

**Expected:** The completed task remains completed and the deleted task does not reappear

#### TC-027 — Task title with HTML/script is escaped, not executed

`security` · `high` · `negative` · Requirements: CREATE-1, LIST-1 · Stories: create-1-as-a-user-i-want-to-create-a-task-with-a-title-and-due-date-so-that-i-

**Preconditions**

- App rendered

**Steps**

1. Create a task with title containing <img src=x onerror=alert(1)> and <script> markup
2. Observe the rendered list

**Expected:** The title is rendered as literal escaped text with no script execution or injected DOM nodes

#### TC-028 — Keyboard operability and accessible names for core actions

`accessibility` · `medium` · Requirements: CREATE-1, DONE-1, DEL-1 · Stories: create-1-as-a-user-i-want-to-create-a-task-with-a-title-and-due-date-so-that-i-, done-1-as-a-user-i-want-to-tick-a-task-off-and-un-tick-it-so-that-i-can-track, del-1-as-a-user-i-want-to-delete-tasks-so-that-i-can-remove-things-i-no-long

**Preconditions**

- App served; screen reader available

**Steps**

1. Using keyboard only, add a task, toggle completion, and delete it
2. Run automated axe scan
3. Verify accessible names announced by a screen reader

**Expected:** All actions are reachable and operable by keyboard, controls have meaningful accessible names, and axe reports no critical violations

#### TC-029 — Responsive layout on real devices

`manual` · `low` · Requirements: LIST-1, LIST-4 · Stories: list-1-as-a-user-i-want-all-my-tasks-in-one-list-sorted-by-due-date-so-that-i

**Preconditions**

- App served; access to a phone and desktop browser

**Steps**

1. Open the app on a mobile device and a desktop
2. Add several tasks and view the list and empty state

**Expected:** List and empty-state render legibly and usably across screen sizes without overflow or clipping


### Sprint 2

#### TC-030 — Change due date of an existing task updates displayed date

`integration` · `high` · Requirements: DUE-1 · Stories: due-1-as-a-user-i-want-to-change-the-due-date-of-an-existing-task-so-that-i-

**Preconditions**

- A task exists with due date 2025-01-10

**Steps**

1. Open the task's edit control
2. Change the due date field to 2025-02-15
3. Save the edit

**Expected:** The task row now displays the due date 2025-02-15

#### TC-031 — Domain validates edited due date accepts a valid date

`unit` · `high` · Requirements: DUE-3 · Stories: due-1-as-a-user-i-want-to-change-the-due-date-of-an-existing-task-so-that-i-

**Preconditions**

- Domain update function available

**Steps**

1. Call the edit-due-date function with a well-formed date value
2. Inspect the returned result

**Expected:** The function accepts the date and returns the task with the updated due date

#### TC-032 — Domain rejects an invalid edited due date

`unit` · `high` · `negative` · Requirements: DUE-3 · Stories: due-1-as-a-user-i-want-to-change-the-due-date-of-an-existing-task-so-that-i-

**Preconditions**

- Domain update function available
- Task has existing due date 2025-01-10

**Steps**

1. Call the edit-due-date function with an invalid value such as '2025-13-40'
2. Inspect the returned result

**Expected:** The edit is rejected and the task retains its prior due date 2025-01-10

#### TC-033 — UI rejects invalid or empty edited date and retains prior value

`integration` · `high` · `negative` · Requirements: DUE-3, DUE-1 · Stories: due-1-as-a-user-i-want-to-change-the-due-date-of-an-existing-task-so-that-i-

**Preconditions**

- A task exists with due date 2025-01-10

**Steps**

1. Open the task's edit control
2. Clear the due date field leaving it empty
3. Attempt to save

**Expected:** Save is rejected, a validation message is shown, and the task still displays 2025-01-10

#### TC-034 — Edited due date is persisted to local storage on save

`integration` · `high` · Requirements: DUE-4 · Stories: due-1-as-a-user-i-want-to-change-the-due-date-of-an-existing-task-so-that-i-

**Preconditions**

- A task exists with due date 2025-01-10

**Steps**

1. Edit the task's due date to 2025-03-01 and save
2. Read the persisted tasks payload from the localStorage adapter

**Expected:** The stored payload contains the task with due date 2025-03-01

#### TC-035 — Edited due date survives a page reload

`e2e` · `high` · Requirements: DUE-4 · Stories: due-1-as-a-user-i-want-to-change-the-due-date-of-an-existing-task-so-that-i-

**Preconditions**

- App running in a real browser
- A task exists with due date 2025-01-10

**Steps**

1. Edit the task's due date to 2025-03-01 and save
2. Reload the page
3. Observe the task's displayed due date

**Expected:** After reload the task still displays 2025-03-01

#### TC-036 — Domain re-sorts tasks soonest-first after a due-date change

`unit` · `high` · Requirements: DUE-2 · Stories: due-2-as-a-user-i-want-the-task-list-to-re-order-itself-after-i-change-a-due

**Preconditions**

- Three tasks with due dates 2025-01-05, 2025-01-10, 2025-01-20

**Steps**

1. Change the first task's due date to 2025-01-25
2. Retrieve the ordered task list from the domain

**Expected:** Tasks are ordered 2025-01-10, 2025-01-20, 2025-01-25 (soonest first)

#### TC-037 — List re-orders immediately in the UI after a due-date change without reload

`integration` · `high` · Requirements: DUE-2 · Stories: due-2-as-a-user-i-want-the-task-list-to-re-order-itself-after-i-change-a-due

**Preconditions**

- Rendered list has tasks A(2025-01-05), B(2025-01-10), C(2025-01-20)

**Steps**

1. Edit task A's due date to 2025-01-30 and save
2. Observe the rendered order without reloading

**Expected:** The list re-renders in order B, C, A immediately without a page reload

#### TC-038 — Re-ordered list state survives a page reload

`e2e` · `high` · Requirements: DUE-2, DUE-4 · Stories: due-2-as-a-user-i-want-the-task-list-to-re-order-itself-after-i-change-a-due

**Preconditions**

- App running in a real browser with tasks A(2025-01-05), B(2025-01-10), C(2025-01-20)

**Steps**

1. Edit task A's due date to 2025-01-30 and save
2. Reload the page
3. Observe the rendered order

**Expected:** After reload the list is ordered B, C, A (soonest first)

#### TC-039 — All core actions completable using only the keyboard

`accessibility` · `high` · Requirements: UI-1 · Stories: ui-1-as-a-user-i-want-to-operate-all-core-actions-with-the-keyboard-so-that

**Preconditions**

- App open in a real browser, mouse unused

**Steps**

1. Using only Tab/Shift+Tab/Enter/Space, create a new task
2. Complete (toggle) a task via keyboard
3. Edit a task's title/due date via keyboard
4. Delete a task via keyboard

**Expected:** Create, complete, edit, and delete all succeed using keyboard only, with no mouse interaction required

#### TC-040 — Visible focus indicator on every interactive element

`accessibility` · `high` · Requirements: UI-1 · Stories: ui-1-as-a-user-i-want-to-operate-all-core-actions-with-the-keyboard-so-that

**Preconditions**

- App open in a real browser

**Steps**

1. Tab through every interactive element (inputs, toggles, edit/delete buttons)
2. Observe each element as it receives focus

**Expected:** Each interactive element shows a clearly visible focus indicator when focused

#### TC-041 — Form controls and toggles expose accessible names to assistive tech

`accessibility` · `high` · Requirements: UI-2 · Stories: ui-2-as-a-user-i-want-form-controls-and-toggles-to-have-accessible-names-so

**Preconditions**

- App open with a screen reader (e.g. VoiceOver/NVDA)

**Steps**

1. Navigate to the title input, due-date input, complete toggle, edit and delete controls with a screen reader
2. Listen to how each element is announced

**Expected:** Every form control and toggle is announced with a meaningful accessible name

#### TC-042 — Automated axe audit reports no missing-label violations

`accessibility` · `high` · Requirements: UI-2 · Stories: ui-2-as-a-user-i-want-form-controls-and-toggles-to-have-accessible-names-so

**Preconditions**

- App rendered in test harness with axe integration

**Steps**

1. Run an automated axe accessibility scan against the main app view
2. Review the violations report

**Expected:** The scan reports zero label-related (missing accessible name) violations

#### TC-043 — Layout usable at desktop and mobile widths

`accessibility` · `medium` · Requirements: UI-3 · Stories: ui-3-as-a-user-i-want-the-layout-to-remain-usable-on-both-phone-and-desktop

**Preconditions**

- App open in a real browser with device emulation available

**Steps**

1. View the app at a desktop width (e.g. 1280px)
2. Switch to a mobile width (e.g. 375px)
3. Interact with the list and controls at each width

**Expected:** The layout remains usable and all controls remain reachable at both widths

#### TC-044 — No clipping or overlap at 320px-wide viewport

`accessibility` · `medium` · `negative` · Requirements: UI-3 · Stories: ui-3-as-a-user-i-want-the-layout-to-remain-usable-on-both-phone-and-desktop

**Preconditions**

- App open in a real browser

**Steps**

1. Set the viewport width to 320px
2. Inspect the header, input form, task list and controls

**Expected:** No content is clipped, cut off, or overlapping at 320px width

#### TC-045 — In-app notice warns that clearing browser data erases tasks

`integration` · `medium` · Requirements: UI-2 · Stories: ui-2-as-a-user-i-want-an-in-app-notice-warning-that-clearing-browser-data-e

**Preconditions**

- App rendered

**Steps**

1. Load the app
2. Locate the storage-limitation notice

**Expected:** A visible in-app notice informs the user that clearing browser data will erase their tasks

#### TC-046 — Storage-limitation notice is exposed to assistive technology

`accessibility` · `medium` · Requirements: UI-2 · Stories: ui-2-as-a-user-i-want-an-in-app-notice-warning-that-clearing-browser-data-e

**Preconditions**

- App open with a screen reader

**Steps**

1. Navigate to the storage-limitation notice with a screen reader

**Expected:** The notice text is announced/readable by assistive technology (e.g. exposed as a status/note region)

#### TC-047 — App is live on a public static host over HTTPS

`manual` · `high` · Requirements: UI-3 · Stories: due-1-as-a-user-i-want-the-app-deployed-to-a-public-https-host-so-that-i-can

**Preconditions**

- Deployment completed to public static host

**Steps**

1. Open the public deployment URL in a browser
2. Inspect the address bar and connection details

**Expected:** The app loads over HTTPS from a public URL with a valid certificate

#### TC-048 — App loads correctly for a first-time visitor

`e2e` · `high` · Requirements: UI-3 · Stories: due-1-as-a-user-i-want-the-app-deployed-to-a-public-https-host-so-that-i-can

**Preconditions**

- Public deployment live
- Fresh browser profile with no prior localStorage

**Steps**

1. Open the public URL in a clean/incognito session
2. Observe initial render and empty state

**Expected:** The app loads without errors showing an empty usable task list for a first-time visitor

#### TC-049 — Core flows pass QA across major desktop and mobile browsers

`manual` · `high` · Requirements: UI-3, DUE-1, DUE-2 · Stories: due-1-as-a-user-i-want-the-app-deployed-to-a-public-https-host-so-that-i-can

**Preconditions**

- Public deployment live
- Access to Chrome, Firefox, Safari desktop and iOS/Android mobile browsers

**Steps**

1. On each target browser create, complete, edit due date, and delete a task
2. Verify re-sort and persistence across reload on each browser

**Expected:** Core flows work correctly on all tested major desktop and mobile browsers

#### TC-050 — XSS-style title survives due-date edit without executing

`security` · `medium` · `negative` · Requirements: DUE-1 · Stories: due-1-as-a-user-i-want-to-change-the-due-date-of-an-existing-task-so-that-i-

**Preconditions**

- A task exists whose title contains <img src=x onerror=alert(1)>

**Steps**

1. Edit the task's due date and save
2. Observe the rendered task row

**Expected:** The malicious title renders as inert escaped text and no script executes after the edit

