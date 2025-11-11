"use client";

import { useState, useEffect } from "react";
import { Preference } from "@/types/preference";
import { apiRequest } from "@/utils/api";

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<Preference[]> = await apiRequest("/preferences", "GET");
      if (res.statusCode === 200 && res.data) {
        setPreferences(res.data);
      } else {
        setError(res.message || "Failed to fetch preferences.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch preferences.");
    } finally {
      setLoading(false);
    }
  };

  const createPreference = async (preferenceData: Partial<Preference>) => {
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<Preference> = await apiRequest("/preferences", "POST", preferenceData);
      if (res.statusCode === 201 && res.data) {
        setPreferences((prev) => [...prev, res.data!]);
        return res.data;
      } else {
        setError(res.message || "Failed to create preference.");
        return null;
      }
    } catch (err: any) {
      setError(err.message || "Failed to create preference.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (id: string, preferenceData: Partial<Preference>) => {
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<Preference> = await apiRequest(`/preferences/${id}`, "PATCH", preferenceData);
      if (res.statusCode === 200 && res.data) {
        setPreferences((prev) => prev.map((p) => (p._id === id ? res.data! : p)));
        return res.data;
      } else {
        setError(res.message || "Failed to update preference.");
        return null;
      }
    } catch (err: any) {
      setError(err.message || "Failed to update preference.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deletePreference = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<null> = await apiRequest(`/preferences/${id}`, "DELETE");
      if (res.statusCode === 200) {
        setPreferences((prev) => prev.filter((p) => p._id !== id));
        return true;
      } else {
        setError(res.message || "Failed to delete preference.");
        return false;
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete preference.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return { preferences, loading, error, fetchPreferences, createPreference, updatePreference, deletePreference };
}
