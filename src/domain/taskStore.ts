import { createTask, type NewTaskInput, type Task } from './task';
import type { TaskStorage } from '../storage/taskStorage';

type Listener = (tasks: Task[]) => void;

/**
 * Holds the task collection in memory and writes it straight back to storage on
 * every mutation, so what is on screen and what is persisted never diverge.
 */
export class TaskStore {
  private tasks: Task[];
  private readonly listeners = new Set<Listener>();

  constructor(private readonly storage: TaskStorage) {
    this.tasks = storage.load();
  }

  /** A copy, so callers cannot mutate the collection behind the store's back. */
  getTasks(): Task[] {
    return [...this.tasks];
  }

  add(input: NewTaskInput): Task {
    const task = createTask(input);
    this.tasks = [...this.tasks, task];
    this.commit();
    return task;
  }

  remove(id: string): void {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.commit();
  }

  update(id: string, changes: Partial<Omit<Task, 'id' | 'createdAt'>>): void {
    this.tasks = this.tasks.map((task) =>
      task.id === id ? { ...task, ...changes } : task,
    );
    this.commit();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private commit(): void {
    this.storage.save(this.tasks);
    const snapshot = this.getTasks();
    for (const listener of this.listeners) listener(snapshot);
  }
}
