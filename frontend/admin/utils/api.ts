"use server";

import { cookies } from "next/headers";
import { ApiResponse, PaginatedResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// General API Request function
export async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: object | FormData,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = (await cookies()).get("accessToken")?.value;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Only set Content-Type for JSON. DO NOT set it for FormData!
      ...(!isFormData && body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      credentials: "include",
      body: body
        ? isFormData
          ? (body as FormData)
          : JSON.stringify(body)
        : undefined,
      ...options,
    });

    const responseData = await response.json();

    if (responseData.statusCode && responseData.message && responseData.data) {
      return {
        success: responseData.statusCode >= 200 && responseData.statusCode < 300,
        data: responseData.data,
        message: responseData.message,
      };
    } else if (response.ok) {
      return {
        success: true,
        data: responseData,
        message: null,
      };
    }

    return {
      success: false,
      data: null as T,
      message: responseData.message || "Request failed",
    };
  } catch (err) {
    return {
      success: false,
      data: null as T,
      message: (err as Error).message,
    };
  }
}

// Dashboard API
export async function getDashboardStats(): Promise<ApiResponse<any>> {
  return apiRequest<any>('/api/dashboard/stats');
}

// Menus API
export async function getMenus(page = 1, limit = 10, search = ''): Promise<ApiResponse<PaginatedResponse<any>>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  return apiRequest<PaginatedResponse<any>>(`/api/menus?${params}`);
}

export async function getMenu(id: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`/api/menus/${id}`);
}

export async function createMenu(menu: any): Promise<ApiResponse<any>> {
  return apiRequest<any>('/api/menus', 'POST', menu);
}

export async function updateMenu(id: string, menu: any): Promise<ApiResponse<any>> {
  return apiRequest<any>(`/api/menus/${id}`, 'PUT', menu);
}

export async function deleteMenu(id: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/menus/${id}`, 'DELETE');
}

// Users API
export async function getUsers(page = 1, limit = 10, search = ''): Promise<ApiResponse<PaginatedResponse<any>>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  return apiRequest<PaginatedResponse<any>>(`/api/users?${params}`);
}

export async function getUser(id: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`/api/users/${id}`);
}

export async function createUser(user: any): Promise<ApiResponse<any>> {
  return apiRequest<any>('/api/users', 'POST', user);
}

export async function updateUser(id: string, user: any): Promise<ApiResponse<any>> {
  return apiRequest<any>(`/api/users/${id}`, 'PUT', user);
}

export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/users/${id}`, 'DELETE');
}

// Preferences API
export async function getPreferences(page = 1, limit = 10, search = ''): Promise<ApiResponse<PaginatedResponse<any>>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  return apiRequest<PaginatedResponse<any>>(`/api/preferences?${params}`);
}

export async function getPreference(id: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`/api/preferences/${id}`);
}

export async function updatePreference(id: string, preference: any): Promise<ApiResponse<any>> {
  return apiRequest<any>(`/api/preferences/${id}`, 'PUT', preference);
}

// Schedules API
export async function getSchedules(page = 1, limit = 10, search = ''): Promise<ApiResponse<PaginatedResponse<any>>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  return apiRequest<PaginatedResponse<any>>(`/api/schedules?${params}`);
}

export async function getSchedule(id: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`/api/schedules/${id}`);
}

export async function createSchedule(schedule: any): Promise<ApiResponse<any>> {
  return apiRequest<any>('/api/schedules', 'POST', schedule);
}

export async function updateSchedule(id: string, schedule: any): Promise<ApiResponse<any>> {
  return apiRequest<any>(`/api/schedules/${id}`, 'PUT', schedule);
}

export async function deleteSchedule(id: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/schedules/${id}`, 'DELETE');
}

// Audit Logs API
export async function getAuditLogs(page = 1, limit = 10, search = ''): Promise<ApiResponse<PaginatedResponse<any>>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  return apiRequest<PaginatedResponse<any>>(`/api/audit-logs?${params}`);
}

// Auth API
export async function login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
  return apiRequest<{ token: string; user: any }>('/api/auth/login', 'POST', { email, password });
}

export async function getCurrentUser(): Promise<ApiResponse<any>> {
  return apiRequest<any>('/api/auth/me');
}
