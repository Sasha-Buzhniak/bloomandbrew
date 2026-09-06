import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { apiGet, apiPost } from "@/lib/api";

export interface AuthUser {
  user_id: string;
  email: string;
  name: string;
  picture?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null | false;
  setUser: (u: AuthUser | false) => void;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null | false>(null);

  useEffect(() => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback exchanges the session_id and establishes the session first.
    if (window.location.hash?.includes("session_id=")) {
      return;
    }
    apiGet<AuthUser>("/auth/me")
      .then((u) => setUserState(u))
      .catch(() => setUserState(false));
  }, []);

  const setUser = useCallback((u: AuthUser | false) => setUserState(u), []);

  const login = useCallback(() => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/account";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  }, []);

  const logout = useCallback(async () => {
    await apiPost("/auth/logout").catch(() => undefined);
    setUserState(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
