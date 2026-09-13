"use client";

import React, { useState, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquareQuote,
  FileText,
  Image as ImageIcon,
  ScrollText,
  Settings,
  LogOut,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  UserCheck,
  UserX,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Upload,
  KeyRound,
  Save,
  Check,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useAuth, logoutUser } from "@/lib/auth";
import { adminApi } from "@/lib/admin-api";
import type {
  OverviewData,
  AdminUser,
  AdminReview,
  AdminAuditLog,
  AdminContent,
  AdminMedia,
} from "@/lib/admin-types";

type Tab = "dashboard" | "users" | "reviews" | "content" | "media" | "audit" | "settings";

export default function AdminClient() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Notifications
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  // Passcode Claim State for non-promoted accounts
  const [unauthorized, setUnauthorized] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [claiming, setClaiming] = useState(false);

  // 1. Dashboard State
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // 2. Users State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPages, setUsersPages] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRole, setUsersRole] = useState("");
  const [usersActive, setUsersActive] = useState<string>("");
  const [usersSort, setUsersSort] = useState("created_at");
  const [usersOrder, setUsersOrder] = useState<"asc" | "desc">("desc");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // 3. Reviews State
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [reviewsStatus, setReviewsStatus] = useState("");
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsPages, setReviewsPages] = useState(1);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // 4. Content State
  const [contentList, setContentList] = useState<AdminContent[]>([]);
  const [contentForm, setContentForm] = useState({
    locale: "en",
    key: "hero.title",
    value: "",
    is_published: true,
  });
  const [savingContent, setSavingContent] = useState(false);

  // 5. Media State
  const [mediaList, setMediaList] = useState<AdminMedia[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // 6. Audit State
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPages, setAuditPages] = useState(1);
  const [auditTypeFilter, setAuditTypeFilter] = useState("");
  const [loadingAudit, setLoadingAudit] = useState(false);

  // 7. Settings State
  const [adminName, setAdminName] = useState(currentUser?.name || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch Handlers
  const fetchOverview = async () => {
    setLoadingOverview(true);
    try {
      const data = await adminApi.getOverview();
      setOverview(data);
    } catch (err: any) {
      if (err.message.includes("403") || err.message.toLowerCase().includes("administrator")) {
        setUnauthorized(true);
      } else {
        showToast(err.message, "error");
      }
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await adminApi.getUsers({
        page: usersPage,
        limit: 15,
        search: usersSearch,
        role: usersRole,
        is_active: usersActive === "" ? undefined : usersActive === "true",
        sort: usersSort,
        order: usersOrder,
      });
      setUsers(res.users);
      setUsersTotal(res.total);
      setUsersPages(res.pages);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await adminApi.getReviews({
        status: reviewsStatus,
        page: reviewsPage,
        limit: 15,
      });
      setReviews(res.reviews);
      setReviewsPages(res.pages);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchContent = async () => {
    try {
      const res = await adminApi.getContent();
      setContentList(res);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const fetchMedia = async () => {
    try {
      const res = await adminApi.getMedia();
      setMediaList(res);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const fetchAudit = async () => {
    setLoadingAudit(true);
    try {
      const res = await adminApi.getAuditLogs({
        page: auditPage,
        limit: 25,
        activity_type: auditTypeFilter,
      });
      setAuditLogs(res.logs);
      setAuditPages(res.pages);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoadingAudit(false);
    }
  };

  // Initial & Tab triggers
  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "reviews") fetchReviews();
    if (activeTab === "content") fetchContent();
    if (activeTab === "media") fetchMedia();
    if (activeTab === "audit") fetchAudit();
    if (activeTab === "settings" && currentUser?.name) {
      setAdminName(currentUser.name);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [usersPage, usersRole, usersActive, usersSort, usersOrder]);

  const handleClaim = async (e: FormEvent) => {
    e.preventDefault();
    setClaiming(true);
    try {
      const res = await fetch("/api/auth/claim-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Invalid admin passcode.");
      }
      showToast("Admin privileges activated! Refreshing portal...");
      setUnauthorized(false);
      fetchOverview();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setClaiming(false);
    }
  };

  // Actions
  const handleToggleUserActive = async (targetUser: AdminUser) => {
    const nextState = !targetUser.is_active;
    if (
      !window.confirm(
        `Are you sure you want to ${nextState ? "activate" : "deactivate"} account for ${
          targetUser.name || targetUser.phone_number
        }?`
      )
    )
      return;
    try {
      await adminApi.setUserActive(targetUser.id, nextState);
      showToast(`User account has been ${nextState ? "activated" : "deactivated"}.`);
      fetchUsers();
      if (selectedUser?.id === targetUser.id) {
        setSelectedUser({ ...selectedUser, is_active: nextState });
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteUser = async (targetUser: AdminUser) => {
    if (
      !window.confirm(
        `PERMANENT ACTION: Are you sure you want to deactivate and remove user #${targetUser.id} (${
          targetUser.name || targetUser.phone_number
        })?`
      )
    )
      return;
    try {
      await adminApi.deleteUser(targetUser.id);
      showToast("User account has been successfully removed.");
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleRevokeSessions = async (userId: number) => {
    if (!window.confirm("Terminate all active login sessions for this user?")) return;
    try {
      const res = await adminApi.revokeUserSessions(userId);
      showToast(`Terminated ${res.revoked} active sessions.`);
      if (selectedUser?.id === userId) {
        const updated = await adminApi.getUser(userId);
        setSelectedUser(updated);
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSaveUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await adminApi.editUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
      });
      showToast("User information updated.");
      setEditingUser(null);
      fetchUsers();
      if (selectedUser?.id === editingUser.id) {
        setSelectedUser({
          ...selectedUser,
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
        });
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleReviewStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      await adminApi.updateReviewStatus(id, status);
      showToast(`Review marked as ${status}.`);
      fetchReviews();
      fetchOverview();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Delete this review permanently?")) return;
    try {
      await adminApi.deleteReview(id);
      showToast("Review deleted.");
      fetchReviews();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSaveContent = async (e: FormEvent) => {
    e.preventDefault();
    setSavingContent(true);
    try {
      await adminApi.updateContent(
        contentForm.locale,
        contentForm.key,
        contentForm.value,
        contentForm.is_published
      );
      showToast("Copy override saved successfully.");
      fetchContent();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSavingContent(false);
    }
  };

  const handleUploadMedia = async (e: FormEvent) => {
    e.preventDefault();
    if (!mediaFile) return;
    setUploadingMedia(true);
    try {
      await adminApi.uploadMedia(mediaFile);
      showToast("Image asset uploaded.");
      setMediaFile(null);
      fetchMedia();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (id: number) => {
    if (!window.confirm("Delete this media asset from database?")) return;
    try {
      await adminApi.deleteMedia(id);
      showToast("Media asset deleted.");
      fetchMedia();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await adminApi.updateMe(adminName);
      showToast("Admin profile name updated.");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }
    setChangingPassword(true);
    try {
      await adminApi.changePassword(currPassword, newPassword);
      showToast("Password changed successfully.");
      setCurrPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/login");
  };

  if (unauthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 shadow-xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Verification</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account does not have Admin privileges yet. Enter the administrator passcode to activate owner access for this account.
          </p>

          <form onSubmit={handleClaim} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Admin Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter admin passcode"
                required
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={claiming || !passcode.trim()}
              className="btn-primary w-full justify-center py-2.5 cursor-pointer"
            >
              {claiming ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Unlock Admin Portal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const navItems: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users, badge: overview?.total_users },
    {
      id: "reviews",
      label: "Reviews",
      icon: MessageSquareQuote,
      badge: overview?.pending_reviews ? overview.pending_reviews : undefined,
    },
    { id: "content", label: "Site Content", icon: FileText },
    { id: "media", label: "Media Assets", icon: ImageIcon },
    { id: "audit", label: "Audit Logs", icon: ScrollText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Toast Notice */}
      {notice && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            notice.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              : "bg-destructive/10 text-destructive border-destructive/30"
          }`}
        >
          {notice.type === "success" ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {notice.text}
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Shield className="h-6 w-6 text-primary" />
          <span>KisaanAdmin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg border border-border bg-muted/50"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="hidden md:flex items-center gap-3 px-3 py-4 mb-4 border-b border-border">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">KisaanBuddy</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Admin Control
              </p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-primary-foreground text-primary"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-border space-y-2">
          <div className="px-3 py-2 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase">
              {currentUser?.name ? currentUser.name[0] : "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-foreground">
                {currentUser?.name || "Administrator"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">System Overview</h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Platform health, active metrics, and user acquisition analytics.
                </p>
              </div>
              <button
                onClick={fetchOverview}
                disabled={loadingOverview}
                className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingOverview ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
                <p className="text-xs font-semibold text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold mt-1 text-foreground">
                  {overview?.total_users ?? 0}
                </p>
                <span className="text-[11px] text-emerald-600 font-medium">
                  +{overview?.new_users_7d ?? 0} this week
                </span>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
                <p className="text-xs font-semibold text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold mt-1 text-foreground">
                  {overview?.active_sessions ?? 0}
                </p>
                <span className="text-[11px] text-muted-foreground">Real-time live connections</span>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
                <p className="text-xs font-semibold text-muted-foreground">Active Users (24h)</p>
                <p className="text-2xl font-bold mt-1 text-foreground">
                  {overview?.active_users_24h ?? 0}
                </p>
                <span className="text-[11px] text-primary font-medium">Daily Engagement</span>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
                <p className="text-xs font-semibold text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold mt-1 text-foreground">
                  {overview?.pending_reviews ?? 0}
                </p>
                <span className="text-[11px] text-amber-500 font-medium">Awaiting moderation</span>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Registrations Line Chart */}
              <div className="lg:col-span-2 p-5 rounded-2xl border border-border bg-card shadow-xs">
                <h3 className="font-bold text-sm mb-4">Daily Registrations (Last 15 Days)</h3>
                <div className="h-64 w-full">
                  {overview?.daily_registrations && overview.daily_registrations.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={overview.daily_registrations}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                      No registration data available
                    </div>
                  )}
                </div>
              </div>

              {/* Top Feature Activity */}
              <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm mb-3">Top System Activities (7d)</h3>
                  <div className="space-y-2">
                    {overview?.activity_by_type?.slice(0, 5).map((act, i) => (
                      <div key={i} className="flex justify-between items-center text-xs pb-2 border-b border-border/50">
                        <span className="font-medium text-muted-foreground truncate max-w-[150px]">
                          {act.type}
                        </span>
                        <span className="font-bold text-foreground">{act.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="font-bold text-xs mb-2">Auth OTP Stats (24h)</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-muted/40">
                      <p className="text-[10px] text-muted-foreground">Requested</p>
                      <p className="text-sm font-bold">{overview?.otp_requests_24h ?? 0}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                      <p className="text-[10px]">Verified</p>
                      <p className="text-sm font-bold">{overview?.otp_verified_24h ?? 0}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                      <p className="text-[10px]">Failed</p>
                      <p className="text-sm font-bold">{overview?.otp_failed_24h ?? 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  View, filter, edit, activate, and manage farmer and administrator accounts.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                {usersTotal} registered users
              </span>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <select
                value={usersRole}
                onChange={(e) => {
                  setUsersRole(e.target.value);
                  setUsersPage(1);
                }}
                className="px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground font-medium"
              >
                <option value="">All Roles</option>
                <option value="Farmer">Farmer</option>
                <option value="Admin">Admin</option>
                <option value="Moderator">Moderator</option>
              </select>

              <select
                value={usersActive}
                onChange={(e) => {
                  setUsersActive(e.target.value);
                  setUsersPage(1);
                }}
                className="px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground font-medium"
              >
                <option value="">All Statuses</option>
                <option value="true">Active Only</option>
                <option value="false">Deactivated Only</option>
              </select>

              <button
                onClick={fetchUsers}
                className="btn-primary text-xs justify-center py-2 cursor-pointer"
              >
                Apply Filters
              </button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
              <table className="w-full text-left text-xs text-foreground">
                <thead className="border-b border-border bg-muted/40 uppercase tracking-wider text-[11px] text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No matching users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-semibold">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                              {u.name ? u.name[0].toUpperCase() : "#"}
                            </div>
                            <div>
                              <p className="text-foreground">{u.name || "—"}</p>
                              <p className="text-[10px] text-muted-foreground">ID: #{u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-foreground font-medium">{u.phone_number}</p>
                          <p className="text-[10px] text-muted-foreground">{u.email || "No email"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              u.role === "Admin"
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.is_active ? (
                            <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-destructive font-semibold text-[11px]">
                              <XCircle className="h-3.5 w-3.5" /> Disabled
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-medium">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <button
                            onClick={async () => {
                              const full = await adminApi.getUser(u.id);
                              setSelectedUser(full);
                            }}
                            title="View Details"
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingUser(u)}
                            title="Edit User"
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-primary hover:bg-primary/10"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleUserActive(u)}
                            title={u.is_active ? "Deactivate" : "Activate"}
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-amber-600"
                          >
                            {u.is_active ? (
                              <UserX className="h-3.5 w-3.5" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            title="Delete User"
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <p>
                Page {usersPage} of {usersPages}
              </p>
              <div className="flex gap-1">
                <button
                  disabled={usersPage <= 1}
                  onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-border disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  disabled={usersPage >= usersPages}
                  onClick={() => setUsersPage((p) => p + 1)}
                  className="px-2.5 py-1.5 rounded-lg border border-border disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REVIEWS */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reviews Moderation</h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Moderate farmer feedback, ratings, and site testimonials.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setReviewsStatus("");
                    setReviewsPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    reviewsStatus === "" ? "bg-primary text-primary-foreground" : "border border-border"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setReviewsStatus("pending");
                    setReviewsPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    reviewsStatus === "pending"
                      ? "bg-amber-500 text-white"
                      : "border border-border text-amber-600"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => {
                    setReviewsStatus("approved");
                    setReviewsPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    reviewsStatus === "approved"
                      ? "bg-emerald-600 text-white"
                      : "border border-border text-emerald-600"
                  }`}
                >
                  Approved
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingReviews ? (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Loading reviews...
                </div>
              ) : reviews.length === 0 ? (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  No reviews found for this status.
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{r.name}</h4>
                          <p className="text-[11px] text-muted-foreground">
                            {r.location} · {r.crop}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            r.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : r.status === "rejected"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <p className="text-xs text-foreground italic mb-4">"{r.text}"</p>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <div className="text-amber-500 text-xs">{"★".repeat(r.stars)}</div>
                      <div className="space-x-1">
                        {r.status !== "approved" && (
                          <button
                            onClick={() => handleReviewStatus(r.id, "approved")}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        )}
                        {r.status !== "rejected" && (
                          <button
                            onClick={() => handleReviewStatus(r.id, "rejected")}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted text-muted-foreground hover:bg-destructive hover:text-white"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="p-1 rounded-lg text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CONTENT */}
        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Site Content Management</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Manage locale-specific UI text and publishable landing page copy.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <form
                onSubmit={handleSaveContent}
                className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs"
              >
                <h3 className="font-bold text-base">Create / Update Copy</h3>
                <div>
                  <label className="block text-xs font-semibold mb-1">Locale</label>
                  <select
                    value={contentForm.locale}
                    onChange={(e) => setContentForm({ ...contentForm, locale: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-border bg-background"
                  >
                    <option value="en">English (en)</option>
                    <option value="hi">Hindi (hi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Content Key</label>
                  <input
                    type="text"
                    required
                    value={contentForm.key}
                    onChange={(e) => setContentForm({ ...contentForm, key: e.target.value })}
                    placeholder="e.g. hero.title, featuresBadge"
                    className="w-full p-2.5 text-xs rounded-xl border border-border bg-background"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Content Value</label>
                  <textarea
                    required
                    rows={4}
                    value={contentForm.value}
                    onChange={(e) => setContentForm({ ...contentForm, value: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-border bg-background"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="content_pub"
                    checked={contentForm.is_published}
                    onChange={(e) =>
                      setContentForm({ ...contentForm, is_published: e.target.checked })
                    }
                  />
                  <label htmlFor="content_pub" className="text-xs font-semibold">
                    Published Live Immediately
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={savingContent}
                  className="btn-primary w-full justify-center text-xs py-2.5"
                >
                  {savingContent ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Content Override
                </button>
              </form>

              {/* Saved list */}
              <div className="p-5 rounded-2xl border border-border bg-card shadow-xs">
                <h3 className="font-bold text-base mb-3">Saved Overrides ({contentList.length})</h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {contentList.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No custom overrides yet.</p>
                  ) : (
                    contentList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() =>
                          setContentForm({
                            locale: item.locale,
                            key: item.key,
                            value: item.value,
                            is_published: item.is_published,
                          })
                        }
                        className="p-3 rounded-xl border border-border hover:bg-muted/40 cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span>
                            [{item.locale}] {item.key}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              item.is_published
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.is_published ? "Live" : "Draft"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{item.value}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MEDIA */}
        {activeTab === "media" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Media Assets</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Durable media uploaded to backend and application database.
              </p>
            </div>

            <form
              onSubmit={handleUploadMedia}
              className="p-5 rounded-2xl border border-border bg-card flex flex-col sm:flex-row items-center gap-4 shadow-xs"
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                className="text-xs text-foreground"
                required
              />
              <button
                type="submit"
                disabled={uploadingMedia || !mediaFile}
                className="btn-primary text-xs py-2.5 px-4 whitespace-nowrap"
              >
                {uploadingMedia ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Upload Image (Max 5MB)
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaList.map((m) => (
                <div key={m.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
                  <div className="h-32 bg-muted flex items-center justify-center overflow-hidden">
                    <img
                      src={`/api/media/${m.id}`}
                      alt={m.filename}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold truncate text-foreground">{m.filename}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {Math.ceil(m.size_bytes / 1024)} KB · {m.content_type}
                    </p>
                    <div className="mt-3 flex justify-between items-center pt-2 border-t border-border">
                      <a
                        href={`/api/media/${m.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-primary font-semibold flex items-center gap-1 hover:underline"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                      <button
                        onClick={() => handleDeleteMedia(m.id)}
                        className="text-destructive hover:opacity-80"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT LOGS */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Audit & Security Logs</h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Tamper-evident trace of all administrative, security, and auth events.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Filter by event type..."
                  value={auditTypeFilter}
                  onChange={(e) => setAuditTypeFilter(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchAudit()}
                  className="px-3 py-1.5 text-xs rounded-xl border border-border bg-card"
                />
                <button
                  onClick={fetchAudit}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground"
                >
                  Filter
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
              <table className="w-full text-left text-xs text-foreground">
                <thead className="border-b border-border bg-muted/40 uppercase tracking-wider text-[11px] text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Event Type</th>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingAudit ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                        Loading audit logs...
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No audit events recorded.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/30 font-mono text-[11px]">
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {new Date(log.logged_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-semibold text-primary">
                          {log.activity_type}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {log.user_id ? `#${log.user_id}` : "System/Anonymous"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {log.ip_address || "—"}
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-muted-foreground font-sans">
                          {log.details || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <p>
                Page {auditPage} of {auditPages}
              </p>
              <div className="flex gap-1">
                <button
                  disabled={auditPage <= 1}
                  onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-border disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  disabled={auditPage >= auditPages}
                  onClick={() => setAuditPage((p) => p + 1)}
                  className="px-2.5 py-1.5 rounded-lg border border-border disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl">
            <div className="border-b border-border pb-4">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Settings</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Manage administrator credentials and account security preferences.
              </p>
            </div>

            {/* Profile update */}
            <form
              onSubmit={handleSaveProfile}
              className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs"
            >
              <h3 className="font-bold text-base">Profile Information</h3>
              <div>
                <label className="block text-xs font-semibold mb-1">Display Name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-border bg-background"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className="btn-primary text-xs py-2 px-4"
              >
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save Profile"}
              </button>
            </form>

            {/* Change Password */}
            <form
              onSubmit={handleChangePassword}
              className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs"
            >
              <h3 className="font-bold text-base">Change Administrator Password</h3>
              <div>
                <label className="block text-xs font-semibold mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-border bg-background"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">New Password (Min 8 chars)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-border bg-background"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-border bg-background"
                />
              </div>
              <button
                type="submit"
                disabled={changingPassword}
                className="btn-primary text-xs py-2 px-4"
              >
                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Update Password"}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* MODAL 1: VIEW USER DETAILS */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-xl w-full rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">User Profile Details</h3>
                <p className="text-xs text-muted-foreground">ID: #{selectedUser.id}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-1 rounded-lg hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-muted-foreground">Name:</span>
                <p className="font-bold text-foreground mt-0.5">{selectedUser.name || "—"}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-muted-foreground">Phone:</span>
                <p className="font-bold text-foreground mt-0.5">{selectedUser.phone_number}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-muted-foreground">Email:</span>
                <p className="font-bold text-foreground mt-0.5">{selectedUser.email || "—"}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-muted-foreground">Role:</span>
                <p className="font-bold text-primary mt-0.5">{selectedUser.role}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-muted-foreground">Status:</span>
                <p className="font-bold mt-0.5">
                  {selectedUser.is_active ? "Active" : "Disabled"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-muted-foreground">Provider:</span>
                <p className="font-bold text-foreground mt-0.5">{selectedUser.provider}</p>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-xs">
                  Active Sessions ({selectedUser.active_sessions?.length || 0})
                </h4>
                {selectedUser.active_sessions && selectedUser.active_sessions.length > 0 && (
                  <button
                    onClick={() => handleRevokeSessions(selectedUser.id)}
                    className="text-[11px] font-semibold text-destructive hover:underline"
                  >
                    Revoke All Sessions
                  </button>
                )}
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto text-[11px]">
                {selectedUser.active_sessions?.length ? (
                  selectedUser.active_sessions.map((s) => (
                    <div key={s.id} className="p-2 rounded-lg border border-border flex justify-between">
                      <span>
                        {s.browser || "Unknown"} on {s.os || "Device"} ({s.device_type})
                      </span>
                      <span className="text-muted-foreground">
                        Last: {new Date(s.last_active_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No active sessions.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => {
                  setEditingUser(selectedUser);
                  setSelectedUser(null);
                }}
                className="btn-primary text-xs py-2 px-4"
              >
                Edit Information
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveUser}
            className="max-w-md w-full rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-start border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Edit User #{editingUser.id}</h3>
              <button onClick={() => setEditingUser(null)} className="p-1 rounded-lg hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingUser.name || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-border bg-background"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={editingUser.email || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-border bg-background"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Assigned Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-border bg-background font-medium"
                >
                  <option value="Farmer">Farmer</option>
                  <option value="Admin">Admin</option>
                  <option value="Moderator">Moderator</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs py-2 px-4">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

