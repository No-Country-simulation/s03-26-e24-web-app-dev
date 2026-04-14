"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { User } from "@/types";
import {
  DEMO_CREDENTIALS,
  loginWithDemoCredentials,
  sessionUser,
  clearSession,
  readLocalDemoDb,
} from "@/lib/local-demo";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAs: (role: "Admin" | "Editor") => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(() => {
    try {
      readLocalDemoDb();
      setUser(sessionUser());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const authenticated = loginWithDemoCredentials(email, password);
      setUser(authenticated);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAs = useCallback(
    async (role: "Admin" | "Editor") => {
      const credential = DEMO_CREDENTIALS.find((item) => {
        if (role === "Admin") {
          return item.email === "moderador@cmspro.demo";
        }

        return item.email === "editor@cmspro.demo";
      });

      if (!credential) {
        throw new Error("No existe una cuenta demo para el rol solicitado");
      }

      await login(credential.email, credential.password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      clearSession();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      login,
      loginAs,
      logout,
      refreshSession,
      isAuthenticated: !!user,
      isAdmin: user?.role === "Admin",
      isEditor: user?.role === "Editor",
    }),
    [user, isLoading, login, loginAs, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
