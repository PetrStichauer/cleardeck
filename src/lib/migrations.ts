// Versioned schema migrations for localStorage persistence
// Each store uses version numbers for migrate callbacks

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateTasksStore(persistedState: any, version: number): any {
  if (version === 0) {
    // v0 → v1: initial schema, no migration needed
    return persistedState;
  }
  return persistedState;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateProjectsStore(persistedState: any, version: number): any {
  if (version === 0) {
    return persistedState;
  }
  return persistedState;
}
