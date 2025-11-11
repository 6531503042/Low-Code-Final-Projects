"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  email: string;
  role: string;
  name: {
    first: string;
    last: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isAuthenticated = !!user;

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockUser: User = {
        _id: "1",
        email: email,
        role: "admin",
        name: {
          first: "Admin",
          last: "User"
        }
      };
      
      setUser(mockUser);
      router.push("/dashboard");
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    router.push("/login");
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}