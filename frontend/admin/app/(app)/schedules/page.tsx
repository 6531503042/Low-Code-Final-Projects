"use client";

import React from "react";
import { ScheduleTable } from "./_components/ScheduleTable";

export default function SchedulesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">User Schedules</h1>
      <ScheduleTable />
    </div>
  );
}
