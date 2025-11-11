"use client";

import { ApiResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Client-side API Request function
export async function clientApiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: object | FormData,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

// Auth API functions
export async function login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
  return clientApiRequest<{ token: string; user: any }>('/auth/login', 'POST', { email, password });
}

export async function getCurrentUser(): Promise<ApiResponse<any>> {
  return clientApiRequest<any>('/auth/me');
}

export async function logout(): Promise<ApiResponse<void>> {
  return clientApiRequest<void>('/auth/logout', 'POST');
}
