import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { getCurrentUser, logoutUser } from "@/services/auth";

export type AuthUser = {
  id: string;
  email?: string;
  username?: string;
  formFinished: boolean;
  twoFactorEnabled?: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;

  pendingUser: AuthUser | null;
  pendingToken: string | null;

  setPendingUser: (user: AuthUser | null) => void;
  setPendingToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function normalizeAuthUser(user: AuthUser | null): AuthUser | null {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    formFinished: user.formFinished === true,
    twoFactorEnabled: user.twoFactorEnabled,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [pendingUser, setPendingUserState] = useState<AuthUser | null>(null);
  const [pendingToken, setPendingTokenState] = useState<string | null>(null);

  function setUser(nextUser: AuthUser | null) {
    setUserState(normalizeAuthUser(nextUser));

    if (nextUser) {
      setPendingUserState(null);
      setPendingTokenState(null);
    }
  }

  useEffect(() => {
    async function restoreUser() {
      try {
        const currentUser = await getCurrentUser();

        setUserState(normalizeAuthUser(currentUser));
      } catch (error) {
        setUserState(null);
      } finally {
        setAuthLoading(false);
      }
    }

    restoreUser();
  }, []);

  async function logout() {
    try {
      await logoutUser();
    } finally {
      setUserState(null);
      setPendingUserState(null);
      setPendingTokenState(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        authLoading,
        setUser,
        logout,
        pendingUser,
        pendingToken,
        setPendingUser: setPendingUserState,
        setPendingToken: setPendingTokenState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
