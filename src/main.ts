import './styles.css';
import { TaskStore } from './domain/taskStore';
import { TaskStorage } from './storage/taskStorage';
import { resolveStorage } from './storage/safeStorage';
import { mountApp } from './ui/app';

const { storage, persistent } = resolveStorage();
const store = new TaskStore(new TaskStorage(storage));

const root = document.querySelector<HTMLDivElement>('#app');
if (root) mountApp(root, store, { persistent });
