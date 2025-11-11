"use client";

import React from "react";
import { MenuTable } from "./_components/MenuTable";

export default function MenusPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Menu Management</h1>
      <MenuTable />
    </div>
  );
}
