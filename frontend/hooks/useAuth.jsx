"use client";

import { useState, useEffect, createContext, useContext } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1069/";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      const response = await fetch(`${BASE_URL}api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }
      const data = await response.json();
      localStorage.setItem("token", data.token);
      return await checkAuth(); // Refresh user state after login
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("token");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    try {
      if (!name || !email || !password) {
        throw new Error("Name, email, and password are required");
      }
      const response = await fetch(`${BASE_URL}api/user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error("Signup failed");
      }
      const data = await response.json();
      localStorage.setItem("token", data.token);
      return await checkAuth(); // Refresh user state after signup
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return false;
      }
      const response = await fetch(`${BASE_URL}api/user/getUser`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Authentication check failed");
      }
      const data = await response.json();
      setUser(data);
      return true;
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      localStorage.removeItem("token");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          setUser(null);
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
      }
    };
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ login, signup, checkAuth, logout, user, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
