'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Users } from "lucide-react";
import UserTable from './_components/UserTable';
import { useUsers } from '@/hooks/useUsers';

export default function UsersPage() {
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();

  const handleCreateUser = async (userData: any) => {
    try {
      await createUser(userData);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (id: string, userData: any) => {
    try {
      await updateUser(id, userData);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-md font-medium">User Management</p>
            <p className="text-small text-default-500">Manage user accounts and permissions</p>
          </div>
        </CardHeader>
        <CardBody>
          <UserTable
            users={users}
            loading={loading}
            error={error}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        </CardBody>
      </Card>
    </div>
  );
}
