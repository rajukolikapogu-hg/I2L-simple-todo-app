import './styles.css';
import { TaskStore } from './domain/taskStore';
import { TaskStorage } from './storage/taskStorage';
import { resolveStorage } from './storage/safeStorage';

const { storage, persistent } = resolveStorage();
const store = new TaskStore(new TaskStorage(storage));

const app = document.querySelector<HTMLDivElement>('#app');

function render(): void {
  if (!app) return;
  const count = store.getTasks().length;
  app.innerHTML = `
    <main class="app">
      <h1>Simple Todo App</h1>
      <p>${count} task${count === 1 ? '' : 's'} loaded.</p>
      ${persistent ? '' : '<p class="notice">Browser storage is unavailable, so tasks will only last for this session.</p>'}
    </main>
  `;
}

store.subscribe(render);
render();
