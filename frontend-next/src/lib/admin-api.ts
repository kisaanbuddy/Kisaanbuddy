import { fetchWithAuth } from "./auth";
import type {
  OverviewData,
  AdminUser,
  AdminReview,
  AdminAuditLog,
  AdminContent,
  AdminMedia,
} from "./admin-types";

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetchWithAuth(`/api/admin${path}`, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Admin request failed (${res.status})`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json();
}

export const adminApi = {
  getOverview: () => adminFetch<OverviewData>("/overview"),

  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    is_active?: boolean;
    provider?: string;
    sort?: string;
    order?: "asc" | "desc";
  }) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set("page", String(params.page));
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.search) sp.set("search", params.search);
    if (params?.role) sp.set("role", params.role);
    if (params?.is_active !== undefined) sp.set("is_active", String(params.is_active));
    if (params?.provider) sp.set("provider", params.provider);
    if (params?.sort) sp.set("sort", params.sort);
    if (params?.order) sp.set("order", params.order);
    const qs = sp.toString();
    return adminFetch<{
      total: number;
      page: number;
      limit: number;
      pages: number;
      users: AdminUser[];
    }>(`/users${qs ? `?${qs}` : ""}`);
  },

  getUser: (id: number) => adminFetch<AdminUser>(`/users/${id}`),

  editUser: (id: number, data: { name?: string; email?: string; role?: string }) =>
    adminFetch<AdminUser>(`/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  setUserActive: (id: number, isActive: boolean) =>
    adminFetch<{ ok: boolean; is_active: boolean }>(`/users/${id}/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: isActive }),
    }),

  deleteUser: (id: number) =>
    adminFetch<void>(`/users/${id}`, {
      method: "DELETE",
    }),

  revokeUserSessions: (id: number) =>
    adminFetch<{ ok: boolean; revoked: number }>(`/users/${id}/revoke-sessions`, {
      method: "POST",
    }),

  getReviews: (params?: { status?: string; page?: number; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.status) sp.set("status", params.status);
    if (params?.page) sp.set("page", String(params.page));
    if (params?.limit) sp.set("limit", String(params.limit));
    const qs = sp.toString();
    return adminFetch<{
      total: number;
      page: number;
      limit: number;
      pages: number;
      reviews: AdminReview[];
    }>(`/reviews${qs ? `?${qs}` : ""}`);
  },

  updateReviewStatus: (id: string, status: "pending" | "approved" | "rejected") =>
    adminFetch<{ ok: boolean; id: string; status: string }>(`/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),

  deleteReview: (id: string) =>
    adminFetch<void>(`/reviews/${id}`, {
      method: "DELETE",
    }),

  getAuditLogs: (params?: {
    page?: number;
    limit?: number;
    activity_type?: string;
    user_id?: number;
    date_from?: string;
    date_to?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set("page", String(params.page));
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.activity_type) sp.set("activity_type", params.activity_type);
    if (params?.user_id) sp.set("user_id", String(params.user_id));
    if (params?.date_from) sp.set("date_from", params.date_from);
    if (params?.date_to) sp.set("date_to", params.date_to);
    const qs = sp.toString();
    return adminFetch<{
      total: number;
      page: number;
      limit: number;
      pages: number;
      logs: AdminAuditLog[];
    }>(`/audit-logs${qs ? `?${qs}` : ""}`);
  },

  getContent: () => adminFetch<AdminContent[]>("/content"),

  updateContent: (locale: string, key: string, value: string, is_published: boolean) =>
    adminFetch<AdminContent>(`/content/${encodeURIComponent(locale)}/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value, is_published }),
    }),

  getMedia: () => adminFetch<AdminMedia[]>("/media"),

  uploadMedia: async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return adminFetch<{ id: number; filename: string; url: string }>("/media", {
      method: "POST",
      body: fd,
    });
  },

  deleteMedia: (id: number) =>
    adminFetch<void>(`/media/${id}`, {
      method: "DELETE",
    }),

  getMe: () =>
    adminFetch<{
      id: number;
      name?: string;
      email?: string;
      phone_number: string;
      role: string;
      provider: string;
      created_at: string;
      last_login_at?: string;
    }>("/me"),

  updateMe: (name: string) =>
    adminFetch<{ ok: boolean; name: string }>("/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }),

  changePassword: (current_password: string, new_password: string) =>
    adminFetch<{ ok: boolean; message: string }>("/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password, new_password }),
    }),
};

