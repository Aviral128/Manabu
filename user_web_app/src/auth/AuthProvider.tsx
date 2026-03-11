"use client";

import React from "react";

import type { AuthUser, UserRole } from "./shared";
import { fetchSession, login as loginApi, logout as logoutApi, register as registerApi } from "../services/auth";

type AuthState =
  | { status: "loading"; accessToken?: undefined; userId?: undefined; role?: undefined; user?: undefined }
  | { status: "anon"; accessToken?: undefined; userId?: undefined; role?: undefined; user?: undefined }
  | { status: "auth"; accessToken?: string; userId: string; role: UserRole; user: AuthUser };

type AuthContextValue = {
  state: AuthState;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [state, setState] = React.useState<AuthState>({ status: "loading" });

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const session = await fetchSession();
        if (!alive) return;

        if (session.authenticated && session.user) {
          setState({
            status: "auth",
            accessToken: undefined,
            userId: session.user.userId,
            role: session.user.role,
            user: session.user,
          });
          return;
        }
      } catch {
        // Fall through to anonymous state on boot failures.
      }

      if (alive) {
        setState({ status: "anon" });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const res = await loginApi({ email, password });
    const next: AuthState = {
      status: "auth",
      accessToken: res.token,
      userId: res.user.userId,
      role: res.user.role,
      user: res.user,
    };
    setState(next);
  }, []);

  const signup = React.useCallback(async (email: string, password: string, displayName: string) => {
    const res = await registerApi({ email, password, displayName });
    setState({
      status: "auth",
      accessToken: res.token,
      userId: res.user.userId,
      role: res.user.role,
      user: res.user,
    });
  }, []);

  const logout = React.useCallback(async () => {
    await logoutApi().catch(() => undefined);
    setState({ status: "anon" });
  }, []);

  return <AuthContext.Provider value={{ state, isReady: state.status !== "loading", login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
