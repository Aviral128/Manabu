import React from "react";

import { clearToken, getToken, setToken } from "../security/tokenStore";
import { fetchProfile, login as loginRequest, signup as signupRequest, type MobileUser } from "../services/auth";
import { reportMobileError } from "../services/monitoring";

type AuthContextValue = {
  user: MobileUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<MobileUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const token = await getToken();
        if (!token) {
          if (alive) setLoading(false);
          return;
        }

        const profile = await fetchProfile();
        if (alive) {
          setUser(profile);
        }
      } catch (error) {
        await clearToken();
        await reportMobileError(error, { type: "auth.restore" });
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    await setToken(result.token);
    const profile = await fetchProfile();
    setUser(profile);
  }, []);

  const signup = React.useCallback(async (name: string, email: string, password: string) => {
    const result = await signupRequest(name, email, password);
    await setToken(result.token);
    const profile = await fetchProfile();
    setUser(profile);
  }, []);

  const logout = React.useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = React.useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
