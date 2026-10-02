"use client";

import { AuthContext, AuthProvider } from "./AuthContext";
import { useAuth } from "./useAuth";
import { ReactNode } from "react";

// This component provides the authentication context to the entire app
export default function AuthProviderWrapper({ children }: { children: ReactNode }) {
  const auth = useAuth();
  
  return (
    <AuthProvider value={auth}>
      {children}
    </AuthProvider>
  );
}