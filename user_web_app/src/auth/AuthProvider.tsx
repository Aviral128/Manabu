"use client";

import React from "react";

import { AUTH_COOKIES, type AuthMessageResponse, type AuthUser, type UserRole } from "./shared";
import { fetchSession, login as loginApi, logout as logoutApi, signup as signupApi } from "../services/auth";

type AuthState =
  | { status: "loading"; accessToken?: undefined; userId?: undefined; role?: undefined; user?: undefined }
  | { status: "anon"; accessToken?: undefined; userId?: undefined; role?: undefined; user?: undefined }
  | { status: "auth"; accessToken?: string; userId: string; role: UserRole; user: AuthUser };

type AuthContextValue = {
  state: AuthState;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<AuthMessageResponse>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

type RefreshOptions = {
  setLoading?: boolean;
  preserveCurrentOnError?: boolean;
};

function persistClientAuth(user: AuthUser, accessToken?: string) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(AUTH_COOKIES.user, JSON.stringify(user));
  if (accessToken) {
    window.localStorage.setItem(AUTH_COOKIES.accessToken, accessToken);
  } else {
    window.localStorage.removeItem(AUTH_COOKIES.accessToken);
  }
}

function clearClientAuth() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(AUTH_COOKIES.accessToken);
  window.localStorage.removeItem(AUTH_COOKIES.user);
}

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [state, setState] = React.useState<AuthState>({ status: "loading" });
  const stateRef = React.useRef<AuthState>({ status: "loading" });
  const requestVersionRef = React.useRef(0);
  const mountedRef = React.useRef(false);

  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const applyAuthenticatedState = React.useCallback((user: AuthUser, accessToken?: string) => {
    persistClientAuth(user, accessToken);
    setState({
      status: "auth",
      accessToken,
      userId: user.userId,
      role: user.role,
      user,
    });
  }, []);

  const refreshSession = React.useCallback(
    async ({ setLoading = false, preserveCurrentOnError = false }: RefreshOptions = {}) => {
      const requestVersion = ++requestVersionRef.current;

      if (setLoading && mountedRef.current) {
        setState((current) => (current.status === "loading" ? current : { status: "loading" }));
      }

      try {
        const session = await fetchSession();
        if (!mountedRef.current || requestVersionRef.current !== requestVersion) return;

        if (session.authenticated && session.user) {
          applyAuthenticatedState(session.user);
          return;
        }

        clearClientAuth();
        setState({ status: "anon" });
      } catch {
        if (!mountedRef.current || requestVersionRef.current !== requestVersion) return;
        if (preserveCurrentOnError && stateRef.current.status === "auth") {
          return;
        }
        clearClientAuth();
        setState({ status: "anon" });
      }
    },
    [applyAuthenticatedState],
  );

  React.useEffect(() => {
    mountedRef.current = true;
    void refreshSession({ setLoading: true });

    return () => {
      mountedRef.current = false;
      requestVersionRef.current += 1;
    };
  }, [refreshSession]);

  React.useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key && event.key !== AUTH_COOKIES.user && event.key !== AUTH_COOKIES.accessToken) {
        return;
      }
      void refreshSession({ preserveCurrentOnError: true });
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      void refreshSession({ preserveCurrentOnError: true });
    }

    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshSession]);

  const login = React.useCallback(async (email: string, password: string) => {
    const requestVersion = ++requestVersionRef.current;
    const res = await loginApi({ email, password });
    if (!mountedRef.current || requestVersionRef.current !== requestVersion) return;
    applyAuthenticatedState(res.user, res.token);
  }, [applyAuthenticatedState]);

  const signup = React.useCallback(async (email: string, password: string, displayName: string) => {
    return signupApi({ email, password, displayName });
  }, []);

  const logout = React.useCallback(async () => {
    requestVersionRef.current += 1;
    await logoutApi().catch(() => undefined);
    if (!mountedRef.current) return;
    clearClientAuth();
    setState({ status: "anon" });
  }, []);

  const contextValue = React.useMemo(
    () => ({ state, isReady: state.status !== "loading", login, signup, logout }),
    [login, logout, signup, state],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
