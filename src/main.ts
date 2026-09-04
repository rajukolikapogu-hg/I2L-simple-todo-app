import './styles.css';
import { TaskStore } from './domain/taskStore';
import { TaskStorage } from './storage/taskStorage';

const store = new TaskStore(new TaskStorage(window.localStorage));

const app = document.querySelector<HTMLDivElement>('#app');

function render(): void {
  if (!app) return;
  const count = store.getTasks().length;
  app.innerHTML = `
    <main class="app">
      <h1>Simple Todo App</h1>
      <p>${count} task${count === 1 ? '' : 's'} loaded from browser storage.</p>
    </main>
  `;
}

store.subscribe(render);
render();
