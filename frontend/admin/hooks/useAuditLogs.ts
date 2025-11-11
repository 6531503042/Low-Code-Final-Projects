"use client";

import { useState, useEffect } from "react";
import { AuditLog } from "@/types/audit-log";
import { apiRequest } from "@/utils/api";

export function useAuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<AuditLog[]> = await apiRequest("/audit-logs", "GET");
      if (res.statusCode === 200 && res.data) {
        setAuditLogs(res.data);
      } else {
        setError(res.message || "Failed to fetch audit logs.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return { auditLogs, loading, error, fetchAuditLogs };
}
