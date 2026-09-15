# My Todos

A small, client-only todo app. Add tasks with a due date, tick them off, edit
dates, delete them — all kept in one list sorted by what's due soonest.

There is no backend and no account. Everything lives in your browser's local
storage, which means tasks stay on the device you created them on, and clearing
your browsing data erases them. The app says so in a notice below the list.

## Using it

- **Add a task** — type a title, pick a due date, press **Add task** or `Enter`.
  A blank title is rejected with a message; the due date defaults to today.
- **Complete a task** — tick its checkbox. Completed tasks stay in place, struck
  through, and can be un-ticked.
- **Change a due date** — press **Edit date**, pick a new one, then **Save**
  (`Enter` saves, `Escape` cancels). The list re-orders itself immediately.
- **Delete a task** — press **Delete**, then confirm. Nothing is removed until
  you confirm.

Every action works with the keyboard alone; see [docs/KEYBOARD.md](docs/KEYBOARD.md).

## Running it locally

Requires Node 22 or newer.

```bash
npm install
npm run dev      # dev server with hot reload
```

| Command              | Does                                                 |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Start the dev server                                 |
| `npm run build`      | Typecheck, then build the static bundle into `dist/` |
| `npm run preview`    | Serve the built bundle locally                       |
| `npm test`           | Run the test suite once                              |
| `npm run test:watch` | Run the tests in watch mode                          |
| `npm run lint`       | Lint with ESLint                                     |
| `npm run format`     | Format with Prettier                                 |

## Deploying

`npm run build` produces a fully static `dist/` — plain HTML, CSS and JS with no
server-side anything. It can be served from any static host.

Vite is configured with `base: './'`, so the bundle uses relative asset paths and
works from a subpath (`example.com/todo/`) as readily as from a domain root. No
rebuild is needed when the deploy path changes.

### GitHub Pages

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages, authenticating
with OIDC so there is no token to store.

It is currently **manual only** (`workflow_dispatch`), because Pages is not
available to this repository yet — see the note below. Once it is:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Uncomment the `push: branches: [main]` trigger at the top of the workflow, so
   every merge to `main` deploys.

> GitHub Pages serves private repositories only on paid plans. On a free plan the
> repository must be public for Pages to publish.

### Any other static host

Point the host at this repo with:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 22

That is the whole configuration for Netlify, Vercel, Cloudflare Pages and
similar. All of them serve over HTTPS by default.

## How it's built

Vite + TypeScript, no UI framework — the app is small enough that plain DOM
construction is clearer than a framework, and it keeps the bundle tiny.

| Path           | Holds                                                          |
| -------------- | -------------------------------------------------------------- |
| `src/domain/`  | The `Task` model, the store, sorting and validation — no DOM   |
| `src/storage/` | The localStorage adapter and the safe-storage fallback         |
| `src/ui/`      | DOM construction: the form, the list, the notice               |
| `test/`        | Vitest suites, including an axe-core accessibility audit       |
| `docs/`        | Project documents, the keyboard reference and the QA checklist |

Storage is defensive by design: a missing, unparseable or malformed payload loads
as an empty list rather than crashing, and if `localStorage` is unavailable
entirely the app falls back to in-memory storage and says so.
