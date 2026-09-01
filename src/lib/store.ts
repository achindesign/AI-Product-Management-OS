import { generateSeedData } from './seed';
import type { AppState } from './types';

const STORAGE_KEY = 'aipmos_state_v1';

let state: AppState | null = null;
const listeners = new Set<() => void>();

export function getState(): AppState {
  if (!state) {
    state = loadState();
  }
  return state;
}

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as AppState;
    }
  } catch { /* ignore */ }
  const fresh = generateSeedData();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); } catch { /* ignore */ }
  return fresh;
}

export function saveState(): void {
  if (!state) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function setState(updater: (s: AppState) => void): void {
  const s = getState();
  updater(s);
  saveState();
  notify();
}

export function resetState(): void {
  state = generateSeedData();
  saveState();
  notify();
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify(): void {
  listeners.forEach(fn => fn());
}

// Helper selectors
export function getProducts() { return getState().products; }
export function getEpics(productId?: string) {
  const epics = getState().epics;
  return productId ? epics.filter(e => e.productId === productId) : epics;
}
export function getStories(productId?: string, epicId?: string) {
  const stories = getState().stories;
  return stories.filter(s =>
    (!productId || s.productId === productId) && (!epicId || s.epicId === epicId)
  );
}
