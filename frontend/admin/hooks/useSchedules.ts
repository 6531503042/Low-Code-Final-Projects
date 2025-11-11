"use client";

import { useState, useEffect } from "react";
import { Schedule } from "@/types/schedule";
import { apiRequest } from "@/utils/api";

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<Schedule[]> = await apiRequest("/schedules", "GET");
      if (res.statusCode === 200 && res.data) {
        setSchedules(res.data);
      } else {
        setError(res.message || "Failed to fetch schedules.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch schedules.");
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async (scheduleData: Partial<Schedule>) => {
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<Schedule> = await apiRequest("/schedules", "POST", scheduleData);
      if (res.statusCode === 201 && res.data) {
        setSchedules((prev) => [...prev, res.data!]);
        return res.data;
      } else {
        setError(res.message || "Failed to create schedule.");
        return null;
      }
    } catch (err: any) {
      setError(err.message || "Failed to create schedule.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = async (id: string, scheduleData: Partial<Schedule>) => {
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<Schedule> = await apiRequest(`/schedules/${id}`, "PATCH", scheduleData);
      if (res.statusCode === 200 && res.data) {
        setSchedules((prev) => prev.map((s) => (s._id === id ? res.data! : s)));
        return res.data;
      } else {
        setError(res.message || "Failed to update schedule.");
        return null;
      }
    } catch (err: any) {
      setError(err.message || "Failed to update schedule.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<null> = await apiRequest(`/schedules/${id}`, "DELETE");
      if (res.statusCode === 200) {
        setSchedules((prev) => prev.filter((s) => s._id !== id));
        return true;
      } else {
        setError(res.message || "Failed to delete schedule.");
        return false;
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete schedule.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return { schedules, loading, error, fetchSchedules, createSchedule, updateSchedule, deleteSchedule };
}
