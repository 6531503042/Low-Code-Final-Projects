"use client";

import React from "react";
import { AuditLogsTable } from "./_components/AuditLogsTable";

export default function AuditLogsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Audit Logs</h1>
      <AuditLogsTable />
    </div>
  );
}
