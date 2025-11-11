"use client";

import React from "react";
import { PreferenceTable } from "./_components/PreferenceTable";

export default function PreferencesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">User Preferences</h1>
      <PreferenceTable />
    </div>
  );
}
