# Project Plan

**Project:** Simple Todo App
**Application type:** B2C · Consumer
**Total duration:** 3 wks
**Total investment:** $15,600
**Scope basis:** Full approved scope

## Summary
This is a small, client-only browser Todo app with no backend, accounts, or integrations — data lives in the browser's local storage. It's a fast build; the only real complexity is defensive local-storage handling (corruption/empty-state) and accessibility polish. Expect roughly a 3-week end-to-end delivery, with the bulk of cost in core CRUD, list rendering, and QA across browsers.

## 1. Purpose & how to read this plan

This plan turns the approved Technical Design Document into delivery work. Every user story references the requirement IDs it satisfies, so any line of the plan can be traced back to the TDD and forward to the sprint that delivers it. Requirement coverage is checked in Appendix A: if a requirement is not delivered by a story, it is named there rather than quietly dropped.

**Requirement ID scheme:** 28 requirement ids reused verbatim from the Technical Design Document; 0 assigned by Idea2Launch as <MODULE>-<n> for modules the TDD left un-numbered.

Section 6 — the per-sprint stories, tasks and acceptance criteria — is published separately as the **Sprint Plan** document.

## 2. Planning assumptions & team model

| Input | Value |
| --- | --- |
| Cadence | Two-week sprints; 2 sprints total (Sprint 2 is a shortened one-week close-out per the fixed windows). |
| Sprints | 2 |
| Timeline | 3 weeks from kickoff |
| Velocity | Roughly 2.25 person-weeks of task effort in Sprint 1 and ~1.4 in Sprint 2, comfortably absorbed by AI-accelerated delivery within the fixed windows. |
| Estimation unit | person-weeks (task sizing carried through from the agreed breakdown; not re-estimated here). |
| Total committed points | 41 |

**Team model**

- Senior engineer (offshore) steers architecture, reviews AI output, and assures quality — humans ~0.2-0.35 person-weeks per phase against AI ~0.3-0.5 person-weeks doing implementation and test authoring.
- QA (offshore) defines acceptance and validates behaviour, AI-assisted on test generation and cross-browser checks.
- DevOps sets up the static hosting/CI pipeline and handles CDN deployment, largely AI-assisted.
- PM coordinates client sign-offs and scope confirmation, human-led.
- AI agents perform the heavy lifting on coding and test scaffolding; senior engineers review and integrate.

**Assumptions made**

- Sprint windows are fixed as given: Sprint 1 = weeks 1-2, Sprint 2 = week 3 only.
- Task phase numbers in the breakdown (1-7) are mapped to two delivery sprints; the 'phase' field on each sprint reflects the dominant phase grouping.
- Budget and cost are already agreed and are not restated or recomputed here.
- Title-editing remains a conditional scope item pending owner confirmation and is not scheduled unless confirmed.

Human and AI capacity per phase is tabulated under "AI usage by phase & function" below.

## 3. Estimation approach

Work is estimated in relative story points on the Fibonacci scale — never in hours.

| Points | Means |
| --- | --- |
| 1 | Trivial, well understood, no unknowns — a config change or a copy edit. |
| 2 | Small and familiar; one file or one screen, no new integration. |
| 3 | A normal slice of work: a few files, a known pattern, tests included. |
| 5 | Substantial: crosses layers (UI + API + data) or introduces a new pattern. |
| 8 | Large: a new integration, migration, or a subsystem with real unknowns. |
| 13 | Too large to trust — split it before the sprint starts. |

**Definition of Ready** — a story may not enter a sprint until:

- The story states a role, a capability, and a benefit.
- It references at least one requirement id from the Technical Design Document.
- Acceptance criteria are written and testable by someone who did not build it.
- External dependencies (credentials, third-party accounts, content) are identified and available.
- It is estimated at 8 points or fewer; anything larger is split first.

**Definition of Done** — a story is not done until:

- Every acceptance criterion demonstrably passes.
- Automated tests cover the change — unit, integration, or end-to-end as appropriate.
- Typecheck and build are clean and the full test suite passes.
- The change is peer reviewed and merged to the main branch.
- Documentation is updated where behaviour or architecture changed.
- The work is deployed to the review environment and demoable.

## 4. Sprint roadmap at a glance

| Sprint | Weeks | Theme | Goal | Points |
| --- | --- | --- | --- | --- |
| 1 | 1–2 | Foundations, Persistence & Core CRUD | This sprint stands up the whole app skeleton and makes it genuinely usable: the project is set up, tasks are saved safely in the browser, and a person can add tasks with a title and due date, tick them off, delete them, and see them all in one tidy list sorted by when they're due. By the end of this sprint the founder can open the app in a browser and manage a real to-do list, with everything surviving a page reload. | 22 |
| 2 | 3–3 | Due-Date Editing, Accessibility & Launch | This closing sprint rounds the app out and ships it. Users can edit a task's due date and watch the list re-order itself automatically, the whole app becomes keyboard-friendly and accessible across phones and desktops, and a small in-app notice warns that clearing browser data will erase tasks. After cross-browser checks the app is deployed to a public static host so anyone can use it. | 19 |

**Critical path.** Both sprints sit on the critical path because there are only two. Sprint 1 is the harder gate: scaffolding (p1) must precede everything, the persistence adapter (p2) underpins all CRUD, and core CRUD (p3) plus list/sorting (p4) are prerequisites for the due-date editing (p5) delivered in Sprint 2. Any slip in Sprint 1 directly compresses the single week available for editing, accessibility, QA and deployment in Sprint 2.

## 5. Product backlog

Epics mirror the feature areas of the Technical Design Document.

| Epic | TDD area / module | Requirement IDs | Sprint |
| --- | --- | --- | --- |
| Foundation & Persistence | Local Storage Persistence + Project scaffolding | STORE-1, STORE-2, STORE-3, STORE-4 | 1 |
| Task Creation | Task Creation | CREATE-1, CREATE-2, CREATE-3, CREATE-4, CREATE-5 | 1 |
| Completion Status | Completion Status | DONE-1, DONE-2, DONE-3, DONE-4 | 1 |
| Task Deletion | Task Deletion | DEL-1, DEL-2, DEL-3, DEL-4 | 1 |
| List View & Sorting | List View & Sorting | LIST-1, LIST-2, LIST-3, LIST-4 | 1 |
| Due Date Management | Due Date Management | DUE-1, DUE-2, DUE-3, DUE-4 | 2 |
| Accessibility & UI Shell | Accessibility & UI Shell | UI-1, UI-2, UI-3 | 2 |
| Launch | Launch (Cross-browser QA & Deployment) | — | 2 |

## 6. Sprint detail

Published separately as the **Sprint Plan** document: per-sprint goals, the stories and tasks table, acceptance/demo criteria, and sprint-level dependencies and risks.

## 7. Cross-sprint dependency map

| Sprint | Depends on | Required by | Why |
| --- | --- | --- | --- |
| 1 | — | 2 | No upstream dependency — this sprint can start at kickoff. |
| 2 | 1 | — | Needs the deliverables of sprint 1 in place. |

The critical path runs through the sprints with the longest dependency chain: Both sprints sit on the critical path because there are only two. Sprint 1 is the harder gate: scaffolding (p1) must precede everything, the persistence adapter (p2) underpins all CRUD, and core CRUD (p3) plus list/sorting (p4) are prerequisites for the due-date editing (p5) delivered in Sprint 2. Any slip in Sprint 1 directly compresses the single week available for editing, accessibility, QA and deployment in Sprint 2..

## 8. Consolidated risk register

| Risk | Impact | Mitigation | Owner |
| --- | --- | --- | --- |
| Local storage data loss when users clear browser data, use private browsing, or switch devices. | High | Accepted per PRD; surface an in-app data-loss notice so users understand the limitation. | Product Owner |
| localStorage unavailable or over quota in some browsers/modes. | Medium | Storage adapter detects unavailability and degrades to an in-memory usable state; tested in private mode. | Senior Engineer |
| Data corruption on deserialize crashing the app. | Medium | Defensive JSON parsing with schema validation and empty-state fallback, covered by unit tests. | Senior Engineer |
| Scope creep toward sync, accounts, reminders or overdue highlighting. | Medium | Explicit scope-confirmation milestone in Sprint 1; changes routed through the open-decisions log. | Product Owner |
| XSS via unescaped task titles rendered to the DOM. | Low | Rely on framework auto-escaping or explicit encoding of task text on render; include in QA checks. | Senior Engineer |
| Compressed one-week Sprint 2 leaving little slack for QA and deploy fixes. | Medium | Front-load cross-browser QA mid-week and gate the deploy on green exit criteria. | QA |

## 9. Open decisions

| Decision | Needed by | Owner | Default if unresolved |
| --- | --- | --- | --- |
| Should users be able to edit a task's title, or only its due date? | Sprint 1 | Product Owner | Due-date editing only; title editing excluded to keep scope minimal. |
| Should a confirmation prompt be required before deleting a task? | Sprint 1 | Product Owner | Include a lightweight confirmation prompt (DEL-4) as a low-cost safeguard. |
| Should the app show an in-app notice warning that clearing browser data erases tasks? | Sprint 2 | Product Owner | Show a small persistent in-app data-loss notice. |
| How should tasks with identical due dates be ordered (tiebreaker)? | Sprint 1 | Senior Engineer | Break ties by creation timestamp ascending (oldest first). |

## 10. Ceremonies & progress tracking

| Ceremony | Cadence | Purpose |
| --- | --- | --- |
| Sprint planning | Day 1 of each 2-week sprint | Commit to the sprint's stories against the stated velocity. |
| Daily standup | Daily, 15 minutes | Surface blockers early; re-plan the day, not the sprint. |
| Backlog refinement | Mid-sprint | Bring the next sprint's stories to Definition of Ready. |
| Sprint review / demo | Last day of each sprint | Demonstrate the sprint's exit criteria against working software. |
| Retrospective | Last day of each sprint | Agree one process change to carry into the next sprint. |

Progress is tracked as a burndown of committed story points across each 2-week sprint, with the sprint's issues in the project's GitHub repository as the single source of truth: one milestone per sprint, one issue per story, closed when the story meets the Definition of Done.

## Phased schedule

### Phase 1 · 0.5 wks

| Workstream | Focus | Effort |
| --- | --- | --- |
| Project scaffolding | Set up Vite + TypeScript project with linting, formatting, test harness, static hosting pipeline, and the Task type definition. | 0.5 wks |

### Phase 2 · 0.5 wks

| Workstream | Focus | Effort |
| --- | --- | --- |
| Persistence foundation | Build the localStorage adapter with JSON serialize/hydrate, corruption and empty-state fallback handling, and a versioned storage key. | 0.5 wks |

### Phase 3 · 0.8 wks

| Workstream | Focus | Effort |
| --- | --- | --- |
| Core CRUD | Implement task creation with title and due date, deletion, and completion toggle, all wired to the persistence layer with input validation. | 0.8 wks |

### Phase 4 · 0.5 wks

| Workstream | Focus | Effort |
| --- | --- | --- |
| List view & sorting | Render tasks in a single plain list sorted by due date ascending, with completed-task strikethrough shown inline and a friendly empty state. | 0.5 wks |

### Phase 5 · 0.4 wks

| Workstream | Focus | Effort |
| --- | --- | --- |
| Due-date editing | Allow editing a task's due date with date validation, automatic list re-sort, and persistence of the change. | 0.4 wks |

### Phase 6 · 0.5 wks

| Workstream | Focus | Effort |
| --- | --- | --- |
| Accessibility & polish | Add keyboard operability, accessible labels/ARIA, responsive layout across viewports, and an in-app data-loss notice. | 0.5 wks |

### Phase 7 · 0.5 wks

| Workstream | Focus | Effort |
| --- | --- | --- |
| Launch | Cross-browser QA, deployment to a static host/CDN, and lightweight documentation. | 0.5 wks |

## AI usage by phase & function
Human vs AI person-weeks under I2L delivery.

### Phase 1 · Project scaffolding

| Function | Human | AI | AI share | What AI does |
| --- | --- | --- | --- | --- |
| Engineering | 0.2 | 0.4 | 67% | AI generates the Vite+TS scaffold, lint/format config, and Task type; engineer verifies toolchain. |
| DevOps | 0.1 | 0.2 | 67% | AI drafts the static-hosting CI/deploy pipeline config. |

### Phase 2 · Persistence foundation

| Function | Human | AI | AI share | What AI does |
| --- | --- | --- | --- | --- |
| Engineering | 0.3 | 0.5 | 64% | AI writes the localStorage adapter, serialize/hydrate logic, and corruption fallbacks; engineer hardens edge cases. |
| QA | 0.1 | 0.2 | 67% | AI generates unit tests for corrupt/empty/missing storage scenarios. |

### Phase 3 · Core CRUD

| Function | Human | AI | AI share | What AI does |
| --- | --- | --- | --- | --- |
| Engineering | 0.3 | 0.5 | 59% | AI implements create/delete/complete flows, validation, and persistence wiring; engineer reviews. |
| QA | 0.1 | 0.3 | 63% | AI generates unit and integration tests for CRUD acceptance criteria. |

### Phase 4 · List view & sorting

| Function | Human | AI | AI share | What AI does |
| --- | --- | --- | --- | --- |
| Engineering | 0.3 | 0.3 | 58% | AI builds the sorted list renderer, strikethrough styling, and empty state. |
| QA | 0.1 | 0.1 | 60% | AI generates tests for sort ordering and re-render on mutation. |

### Phase 5 · Due-date editing

| Function | Human | AI | AI share | What AI does |
| --- | --- | --- | --- | --- |
| Engineering | 0.2 | 0.3 | 60% | AI implements date edit, re-sort trigger, and persistence; engineer validates date handling. |

### Phase 6 · Accessibility & polish

| Function | Human | AI | AI share | What AI does |
| --- | --- | --- | --- | --- |
| Engineering | 0.3 | 0.3 | 55% | AI adds ARIA labels, keyboard handlers, responsive CSS, and the data-loss notice. |
| QA | 0.1 | 0.1 | 60% | AI drafts accessibility and keyboard-operability checks. |

### Phase 7 · Launch

| Function | Human | AI | AI share | What AI does |
| --- | --- | --- | --- | --- |
| QA | 0.2 | 0.2 | 50% | AI generates cross-browser test matrix; engineer executes final smoke checks. |
| DevOps | 0.1 | 0.1 | 60% | AI finalizes deploy config and generates the README/docs. |
| Delivery Management | 0.1 | 0.1 | 25% | Coordination and launch sign-off; AI drafts release notes. |

## Investment
| Item | Amount |
| --- | --- |
| Scope subtotal | $15,600 |
| **Total project fee** | **$15,600** |

## Assumptions
- Delivered by a small offshore I2L team: one senior full-stack engineer steering AI agents, with fractional QA and part-time PM/architect oversight.
- AI agents generate the majority of scaffolding, domain logic, tests, and documentation; engineers review, refine, and own architecture and quality.
- Scope is strictly the client-only app in the PRD/Blueprint — no backend, accounts, cloud sync, reminders, or overdue highlighting.
- Hosting is a free/low-cost static CDN (Vercel/Netlify/Cloudflare Pages); infra and LLM run costs are negligible for this scope.
- Task title editing and the delete-confirmation prompt are treated as small in-scope extensions resolved during build.
- Excludes ongoing maintenance, marketing, and post-launch feature work.

## Appendix A — Requirement coverage check

| Requirement ID | Delivered by | Sprint |
| --- | --- | --- |
| CREATE-1 | As a User, I want to create a task with a title and due date so that I can capture things I need to do | 1 |
| CREATE-2 | As a User, I want blank-title task creation blocked with a clear message so that I don't accidentally create empty tasks | 1 |
| CREATE-3 | As a User, I want to create a task with a title and due date so that I can capture things I need to do | 1 |
| CREATE-4 | As a User, I want to create a task with a title and due date so that I can capture things I need to do | 1 |
| CREATE-5 | As a User, I want to create a task with a title and due date so that I can capture things I need to do | 1 |
| DUE-1 | As a User, I want to change the due date of an existing task so that I can keep my schedule accurate as plans shift | 2 |
| DUE-2 | As a User, I want the task list to re-order itself after I change a due date so that the soonest tasks always appear first | 2 |
| DUE-3 | As a User, I want to change the due date of an existing task so that I can keep my schedule accurate as plans shift | 2 |
| DUE-4 | As a User, I want to change the due date of an existing task so that I can keep my schedule accurate as plans shift | 2 |
| DONE-1 | As a User, I want to tick a task off and un-tick it so that I can track what I've completed | 1 |
| DONE-2 | As a User, I want to tick a task off and un-tick it so that I can track what I've completed | 1 |
| DONE-3 | As a User, I want to tick a task off and un-tick it so that I can track what I've completed | 1 |
| DONE-4 | As a User, I want to tick a task off and un-tick it so that I can track what I've completed | 1 |
| DEL-1 | As a User, I want to delete tasks so that I can remove things I no longer need | 1 |
| DEL-2 | As a User, I want to delete tasks so that I can remove things I no longer need | 1 |
| DEL-3 | As a User, I want to delete tasks so that I can remove things I no longer need | 1 |
| DEL-4 | As a User, I want to delete tasks so that I can remove things I no longer need | 1 |
| LIST-1 | As a User, I want all my tasks in one list sorted by due date so that I can see what's coming up first | 1 |
| LIST-2 | As a User, I want all my tasks in one list sorted by due date so that I can see what's coming up first | 1 |
| LIST-3 | As a User, I want all my tasks in one list sorted by due date so that I can see what's coming up first | 1 |
| LIST-4 | As a User, I want all my tasks in one list sorted by due date so that I can see what's coming up first | 1 |
| STORE-1 | As a User, I want my tasks saved to and loaded from browser storage so that they survive closing and reopening the browser tab | 1 |
| STORE-2 | As a User, I want my tasks saved to and loaded from browser storage so that they survive closing and reopening the browser tab | 1 |
| STORE-3 | As a User, I want the app to load into a clean, usable state when storage is missing or corrupt so that it never crashes on startup | 1 |
| STORE-4 | As a User, I want the app project scaffolded and a Task model defined so that development can proceed on a stable, testable foundation | 1 |
| UI-1 | As a User, I want to operate all core actions with the keyboard so that I can use the app without a mouse | 2 |
| UI-2 | As a User, I want form controls and toggles to have accessible names so that assistive technology can describe them to me | 2 |
| UI-3 | As a User, I want the layout to remain usable on both phone and desktop so that I can manage tasks on any device | 2 |

28 requirements, 0 unmapped.
