import { readLocalDemoDb } from "./db";
import { DEMO_CREDENTIALS, LOCAL_DEMO_SESSION_KEY } from "./seed";
import type { DemoSession } from "./types";
import type { User } from "@/types";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function findCredential(email: string, password: string) {
  return DEMO_CREDENTIALS.find(
    (item) =>
      item.email.toLowerCase() === email.toLowerCase().trim() &&
      item.password === password,
  );
}

function findUserById(userId: string): User | null {
  const db = readLocalDemoDb();
  return db.users.find((user) => user.id === userId) ?? null;
}

export function readSession(): DemoSession | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(LOCAL_DEMO_SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as DemoSession;
    if (!parsed?.userId) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(LOCAL_DEMO_SESSION_KEY);
}

export function sessionUser(): User | null {
  const session = readSession();

  if (!session) {
    return null;
  }

  return findUserById(session.userId);
}

export function loginWithDemoCredentials(
  email: string,
  password: string,
): User {
  const credential = findCredential(email, password);

  if (!credential) {
    throw new Error("Credenciales invalidas. Usa una cuenta demo disponible.");
  }

  const user = findUserById(credential.userId);

  if (!user) {
    throw new Error("No se encontro la cuenta demo solicitada.");
  }

  if (isBrowser()) {
    const session: DemoSession = {
      userId: user.id,
      loggedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(
      LOCAL_DEMO_SESSION_KEY,
      JSON.stringify(session),
    );
  }

  return user;
}
