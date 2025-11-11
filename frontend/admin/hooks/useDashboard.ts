"use client";

import { useState, useEffect } from "react";
import { DashboardStats } from "@/types/dashboard";
import { apiRequest } from "@/utils/api";

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<DashboardStats>('/dashboard/stats');
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError(res.message || "Failed to fetch dashboard stats.");
        // Fallback data
        setStats({
          totalMenus: 0,
          activeMenus: 0,
          totalUsers: 0,
          todaySuggestions: 0
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch dashboard stats.");
      // Fallback data
      setStats({
        totalMenus: 0,
        activeMenus: 0,
        totalUsers: 0,
        todaySuggestions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
