# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** I2L-simple-todo-app
- **Version:** 0.1.0
- **Date:** 2026-09-06
- **Prepared by:** TestSprite AI Team
- **Branch:** fix/refocus-without-css-escape
- **Target:** http://localhost:4173/ (Vite production build via `npm run build && npm run preview`)
- **Scope:** codebase · frontend · 24 of 30 planned tests (6 redundant cases trimmed)

---

## 2️⃣ Requirement Validation Summary

### Requirement: Create Task
- **Description:** A user can add a task with a title and a due date; the form clears and returns focus to the title field.

| Test | Name | Status |
|------|------|--------|
| TC001 | Add a task and return focus to the title field | ✅ Passed |
| TC007 | Use the default due date when creating a task | ✅ Passed |

- **Analysis / Findings:** Creation works end to end against the production build. The due date field pre-fills with today (`taskForm.ts:43`) and the post-submit reset/refocus sequence (`app.ts:39-40`) behaves as designed.

---

### Requirement: Task Title And Date Validation
- **Description:** Blank or whitespace-only titles and non-ISO due dates are rejected inline, with focus moved to the first failing field.

| Test | Name | Status |
|------|------|--------|
| TC004 | Reject a blank task title | ✅ Passed |
| TC011 | Reject a whitespace-only task title | ✅ Passed |
| TC023 | Show validation and move focus to the first invalid field | ✅ Passed |
| TC008 | Reject an invalid due date | ❌ Failed — **invalid test, not a defect** |

- **Analysis / Findings:** The three genuine validation cases pass, including the whitespace-trim rule at `validation.ts:19` and the focus-first-error behaviour at `taskForm.ts:73-76`. TC008 is a defective test: it fills `2020-01-01` — a **well-formed ISO date** — and expects rejection. Neither the PRD nor `validateNewTask` (`validation.ts:16-22`) ever specified rejecting past due dates; `isIsoDate` (`task.ts:25-29`) validates format and calendar validity only. The test also carries two inverted assertions (see §4).

---

### Requirement: Complete And Un-complete Task
- **Description:** A native checkbox toggles completion; completed tasks stay visible with strikethrough and survive reload.

| Test | Name | Status |
|------|------|--------|
| TC015 | Mark a task complete and then incomplete | ✅ Passed |
| TC014 | Mark a task complete and keep the completed state after reload | ✅ Passed |
| TC021 | Preserve completion state after reload | ✅ Passed |

- **Analysis / Findings:** Full coverage, all green. Completion round-trips through `localStorage` correctly and completed rows remain listed per the PRD.

---

### Requirement: Edit Due Date
- **Description:** An inline editor swaps in for the displayed date; saving re-sorts the list, cancelling and Escape discard the edit, and an empty date is rejected with the editor left open.

| Test | Name | Status |
|------|------|--------|
| TC006 | Sort tasks by due date and update order after editing | ✅ Passed |
| TC013 | Edit a task due date and keep the list resorted | ✅ Passed |
| TC024 | Keep editing open when saving an empty due date | ✅ Passed |
| TC030 | Cancel inline date editing with Escape | ✅ Passed |
| TC022 | Cancel an inline due date edit | ❌ Failed — **invalid test, not a defect** |
| TC027 | Use the keyboard to create and edit tasks | ❌ Failed — **invalid test, not a defect** |

- **Analysis / Findings:** The substantive behaviour is verified: re-sorting after save, rejection of an empty date, and Escape-to-cancel all pass. TC022 and TC027 both fail on an **inverted assertion** — each asserts the date input `to_be_visible()` while its own message says it expected the editor to be *closed* (`TC022...py:82`, `TC027...py:60`). TC030 exercises the same `closeEditor` path (`taskList.ts:156-161`) through Escape and passes, and the project's own `test/dueDateEditing.test.ts:76` ("discards an abandoned edit on cancel") and `:90` ("saves on Enter and closes on Escape") both pass. No defect.

---

### Requirement: Delete Task With Inline Confirmation
- **Description:** Delete becomes an inline confirm/cancel pair inside the row; no native dialog.

| Test | Name | Status |
|------|------|--------|
| TC010 | Delete a task from inline confirmation | ✅ Passed |
| TC017 | Delete a task and keep it removed after reload | ✅ Passed |
| TC018 | Cancel inline task deletion | ✅ Passed |

- **Analysis / Findings:** Full coverage, all green. The two-step control (`taskList.ts:194-245`) works and deletions persist across reload.

---

### Requirement: Sorted List View And Empty State
- **Description:** A plain list ordered by due date soonest-first, stable for ties, replaced by an empty state when there are no tasks.

| Test | Name | Status |
|------|------|--------|
| TC009 | Sort tasks by due date when multiple tasks are added | ✅ Passed |
| TC019 | Keep a stable order for tasks with the same due date | ✅ Passed |
| TC020 | Show an empty task list on first load | ✅ Passed |

- **Analysis / Findings:** The tie-break chain in `sortTasks.ts:9-14` (dueDate → createdAt → id) holds under UI-level testing; no reshuffling observed.

---

### Requirement: Local Storage Persistence
- **Description:** Tasks persist under the versioned key across reloads; malformed payloads degrade to an empty list rather than throwing.

| Test | Name | Status |
|------|------|--------|
| TC005 | Keep tasks restored after reloading the page | ✅ Passed |
| TC026 | Show an empty list when stored task data is unreadable | ✅ Passed |

- **Analysis / Findings:** The defensive load path (`taskStorage.ts:38-52`) was confirmed in a real browser: a corrupted `i2l-todo:v1` value yields the empty state instead of a startup failure.

---

### Requirement: Keyboard And Screen Reader Accessibility
- **Description:** Every control is reachable and operable by keyboard in reading order, with focus never lost across re-renders.

| Test | Name | Status |
|------|------|--------|
| TC029 | Operate the app with the keyboard from form to task actions | ❌ Failed — **invalid test, not a defect** |

- **Analysis / Findings:** TC029's assertion (`TC029...py:66`) checks that the **form's own due-date input** is visible, while its message claims to verify "focus moved into the task row controls" — it asserts the wrong element and never checks focus at all. The app sets no `tabindex` anywhere, so tab order follows DOM order. `test/keyboard.test.ts:31` ("puts every primary action in the tab order, in reading order") and `:68` ("completes the whole lifecycle without a pointer") both pass. No defect.

---

## 3️⃣ Coverage & Matching Metrics

- **24** tests executed (30 generated, 6 redundant cases trimmed before the run)
- **20 passed / 4 failed — 83.33% pass rate as reported**
- **100% effective pass rate:** all 4 failures are defects in the generated test code, not in the application
- **9 of 9** code-summary features had at least one test
- **0** confirmed application defects

| Requirement | Total Tests | ✅ Passed | ❌ Failed |
|-------------|-------------|-----------|-----------|
| Create Task | 2 | 2 | 0 |
| Task Title And Date Validation | 4 | 3 | 1 (invalid test) |
| Complete And Un-complete Task | 3 | 3 | 0 |
| Edit Due Date | 6 | 4 | 2 (invalid tests) |
| Delete Task With Inline Confirmation | 3 | 3 | 0 |
| Sorted List View And Empty State | 3 | 3 | 0 |
| Local Storage Persistence | 2 | 2 | 0 |
| Keyboard And Screen Reader Accessibility | 1 | 0 | 1 (invalid test) |
| **Total** | **24** | **20** | **4** |

Corroborating evidence: the project's own Vitest suite passes **96/96 across 14 files**, including the exact behaviours the four failures allege are broken.

---

## 4️⃣ Key Gaps / Risks

1. **All four failures are inverted assertions in generated test code — no application fix is warranted.** TC008, TC022 and TC027 each assert `to_be_visible()` on an element whose accompanying message says it expected the element to be gone or the task not to exist. TC029 asserts on the wrong element entirely. These should be corrected or discarded before the report is used as a quality signal.

2. **TC008 encodes a requirement that does not exist.** It treats a past due date as invalid. If rejecting past dates *is* desired, that is a new feature request against `validation.ts:16-22`, not a bug — and the PRD explicitly does not ask for it.

3. **Genuine untested surface: storage write failures.** `TaskStorage.save` returns `false` on quota-exceeded or storage-disabled-mid-session (`taskStorage.ts:59-67`), but no caller checks the return value (`taskStore.ts:48`). A user could lose a change with no warning. No generated test covers this, and it is not reachable through the UI without fault injection.

4. **Genuine untested surface: the degraded storage notice.** `NO_STORAGE_NOTICE` (`storageNotice.ts:5`) only renders when `resolveStorage()` reports `persistent: false`. TC020 and TC028 only ever saw the normal notice; the private-window/blocked-cookies path was never exercised in a browser.

5. **Title editing is absent by design.** A mistyped title can only be fixed by deleting and re-adding the task (`taskList.ts:60-62`). Worth confirming this matches product intent.

6. **Environment note — IPv6.** The run log is full of `checkPortListening tcp error: connect ECONNREFUSED ::1:4173`. TestSprite resolves `localhost` to `::1` first, while Vite preview binds IPv4-only (`127.0.0.1:4173`). The tests still ran, but the health check was noisy throughout; starting the preview with `--host 127.0.0.1` or binding dual-stack would silence it.

---
