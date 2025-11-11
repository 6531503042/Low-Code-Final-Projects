"use client";

import { useState, useEffect } from "react";
import { User, CreateUserData, UpdateUserData } from "@/types/user";
import { apiRequest } from "@/utils/api";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users
  const fetchUsers = async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      const res = await apiRequest<User[]>(`/users?${params}`);
      if (res.success && res.data) {
        setUsers(res.data);
      } else {
        setError(res.message || "Failed to fetch users.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  // Create new user
  const createNewUser = async (userData: CreateUserData) => {
    try {
      setLoading(true);
      const res = await apiRequest<User>('/users', 'POST', userData);
      if (res.success && res.data) {
        setUsers(prev => [...prev, res.data]);
        return res;
      } else {
        throw new Error(res.message || "Failed to create user.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create user.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const updateExistingUser = async (id: string, userData: UpdateUserData) => {
    try {
      setLoading(true);
      const res = await apiRequest<User>(`/users/${id}`, 'PUT', userData);
      if (res.success && res.data) {
        setUsers(prev => prev.map(u => u._id === id ? res.data : u));
        return res;
      } else {
        throw new Error(res.message || "Failed to update user.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update user.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteExistingUser = async (id: string) => {
    try {
      setLoading(true);
      const res = await apiRequest<void>(`/users/${id}`, 'DELETE');
      if (res.success) {
        setUsers(prev => prev.filter(u => u._id !== id));
        return res;
      } else {
        throw new Error(res.message || "Failed to delete user.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete user.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser: createNewUser,
    updateUser: updateExistingUser,
    deleteUser: deleteExistingUser,
  };
}
