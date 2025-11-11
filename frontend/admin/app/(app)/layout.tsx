'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Utensils, 
  Settings, 
  Clock, 
  FileText,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    key: 'users',
    title: 'Users',
    icon: Users,
    href: '/users',
  },
  {
    key: 'menus',
    title: 'Menus',
    icon: Utensils,
    href: '/menus',
  },
  {
    key: 'preferences',
    title: 'Preferences',
    icon: Settings,
    href: '/preferences',
  },
  {
    key: 'schedules',
    title: 'Schedules',
    icon: Clock,
    href: '/schedules',
  },
  {
    key: 'audit-logs',
    title: 'Audit Logs',
    icon: FileText,
    href: '/audit-logs',
  },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <div className="text-2xl font-bold text-gray-800 mb-6">MeeRaiKin Admin</div>
        {user && (
          <div className="mb-4 p-2 bg-gray-100 rounded-lg">
            <div className="text-sm text-gray-600">Welcome,</div>
            <div className="font-medium text-gray-800">{user.name?.first} {user.name?.last}</div>
            <div className="text-xs text-gray-500">{user.role}</div>
          </div>
        )}
        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.key} className="mb-2">
                <Link 
                  href={item.href} 
                  className={`flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md ${
                    pathname === item.href ? 'bg-blue-100 text-blue-700' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.title}
                </Link>
              </li>
            ))}
            <li className="mb-2">
              <button
                onClick={handleLogout}
                className="flex items-center p-2 text-red-600 hover:bg-red-50 rounded-md w-full text-left"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
