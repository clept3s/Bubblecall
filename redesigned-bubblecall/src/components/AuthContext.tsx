"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { initializeFirebase } from "../lib/firebase/client";
import { onAuthStateChanged, User } from "firebase/auth";

// Initialize Firebase when this module loads
const app = initializeFirebase();

// Create the authentication context
export const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
}>({
  user: null,
  loading: true,
});

// Custom hook to use the authentication context
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(app.auth(), (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}

// Provider component
export const AuthProvider = ({ children, value }: { children: ReactNode; value: any }) => {
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};