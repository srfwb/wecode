/**
 * Fires `saved` after every successful VFS-to-disk flush. The status bar
 * subscribes to render "Saved Xs ago". Kept as a module-level singleton
 * so it is independent of the persistence backend (the actual write path is now
 * under `src/projects/diskAutoSave.ts`).
 */
export const persistenceEvents = new EventTarget();
