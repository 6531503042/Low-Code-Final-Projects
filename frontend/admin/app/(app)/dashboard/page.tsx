'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from "@heroui/react";
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const { stats, loading, error } = useDashboard();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-md font-medium">Dashboard</p>
            <p className="text-small text-default-500">System overview and statistics</p>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-8">
              <p>Loading dashboard...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error: {error}</p>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardBody className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.totalMenus}</p>
                  <p className="text-sm text-gray-500">Total Menus</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.activeMenus}</p>
                  <p className="text-sm text-gray-500">Active Menus</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.totalUsers}</p>
                  <p className="text-sm text-gray-500">Total Users</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{stats.todaySuggestions}</p>
                  <p className="text-sm text-gray-500">Today's Suggestions</p>
                </CardBody>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p>No data available</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
