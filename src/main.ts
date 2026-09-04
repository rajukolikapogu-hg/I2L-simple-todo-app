import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  app.innerHTML = `
    <main class="app">
      <h1>Simple Todo App</h1>
      <p>Project scaffolding is in place. Task features land in the following stories.</p>
    </main>
  `;
}
