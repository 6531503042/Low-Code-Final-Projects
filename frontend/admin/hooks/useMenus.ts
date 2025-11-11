"use client";

import { useState, useEffect } from "react";
import { Menu, CreateMenuData, UpdateMenuData } from "@/types/menu";
import { apiRequest } from "@/utils/api";

export function useMenus() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all menus
  const fetchMenus = async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      const res = await apiRequest<Menu[]>(`/menus?${params}`);
      if (res.success && res.data) {
        setMenus(res.data);
      } else {
        setError(res.message || "Failed to fetch menus.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch menus.");
    } finally {
      setLoading(false);
    }
  };

  // Create new menu
  const createNewMenu = async (menuData: CreateMenuData) => {
    try {
      setLoading(true);
      const res = await apiRequest<Menu>('/menus', 'POST', menuData);
      if (res.success && res.data) {
        setMenus(prev => [...prev, res.data]);
        return res;
      } else {
        throw new Error(res.message || "Failed to create menu.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create menu.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update menu
  const updateExistingMenu = async (id: string, menuData: UpdateMenuData) => {
    try {
      setLoading(true);
      const res = await apiRequest<Menu>(`/menus/${id}`, 'PUT', menuData);
      if (res.success && res.data) {
        setMenus(prev => prev.map(m => m._id === id ? res.data : m));
        return res;
      } else {
        throw new Error(res.message || "Failed to update menu.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update menu.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete menu
  const deleteExistingMenu = async (id: string) => {
    try {
      setLoading(true);
      const res = await apiRequest<void>(`/menus/${id}`, 'DELETE');
      if (res.success) {
        setMenus(prev => prev.filter(m => m._id !== id));
        return res;
      } else {
        throw new Error(res.message || "Failed to delete menu.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete menu.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  return {
    menus,
    loading,
    error,
    fetchMenus,
    createMenu: createNewMenu,
    updateMenu: updateExistingMenu,
    deleteMenu: deleteExistingMenu,
  };
}
