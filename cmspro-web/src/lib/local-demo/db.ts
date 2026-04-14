import { createSeedDb, LOCAL_DEMO_DB_KEY } from "./seed";
import type { LocalDemoDb } from "./types";

export const LOCAL_DEMO_DB_UPDATED_EVENT = "cmspro-local-db-updated";

let memoryDb: LocalDemoDb | null = null;

function cloneDb<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isValidDb(value: unknown): value is LocalDemoDb {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate.version === 1 &&
    Array.isArray(candidate.users) &&
    Array.isArray(candidate.categories) &&
    Array.isArray(candidate.tags) &&
    Array.isArray(candidate.testimonies) &&
    Array.isArray(candidate.shadowCopies) &&
    Array.isArray(candidate.moderationLogs) &&
    Array.isArray(candidate.engagement)
  );
}

function seedAndPersist(): LocalDemoDb {
  const seed = createSeedDb();

  if (isBrowser()) {
    window.localStorage.setItem(LOCAL_DEMO_DB_KEY, JSON.stringify(seed));
  } else {
    memoryDb = cloneDb(seed);
  }

  return seed;
}

export function readLocalDemoDb(): LocalDemoDb {
  if (!isBrowser()) {
    if (!memoryDb) {
      memoryDb = cloneDb(createSeedDb());
    }

    return cloneDb(memoryDb);
  }

  const raw = window.localStorage.getItem(LOCAL_DEMO_DB_KEY);

  if (!raw) {
    return seedAndPersist();
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!isValidDb(parsed)) {
      return seedAndPersist();
    }

    return cloneDb(parsed);
  } catch {
    return seedAndPersist();
  }
}

export function writeLocalDemoDb(db: LocalDemoDb): void {
  const copy = cloneDb(db);

  if (!isBrowser()) {
    memoryDb = copy;
    return;
  }

  window.localStorage.setItem(LOCAL_DEMO_DB_KEY, JSON.stringify(copy));
  window.dispatchEvent(new Event(LOCAL_DEMO_DB_UPDATED_EVENT));
}

export function updateLocalDemoDb(
  updater: (db: LocalDemoDb) => LocalDemoDb,
): LocalDemoDb {
  const current = readLocalDemoDb();
  const updated = updater(current);

  writeLocalDemoDb(updated);

  return cloneDb(updated);
}

export function resetLocalDemoDb(): LocalDemoDb {
  return seedAndPersist();
}
