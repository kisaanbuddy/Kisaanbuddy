export type OverviewData = {
  total_users: number;
  new_users_7d: number;
  active_sessions: number;
  active_users_24h: number;
  otp_requests_24h: number;
  otp_verified_24h: number;
  otp_failed_24h: number;
  feature_events_7d: number;
  language_usage: { language: string; count: number }[];
  daily_registrations: { date: string; count: number }[];
  activity_by_type: { type: string; count: number }[];
  pending_reviews: number;
  total_reviews: number;
};

export type AdminUser = {
  id: number;
  name?: string;
  email?: string;
  phone_number: string;
  role: string;
  is_active: boolean;
  provider: string;
  profile_image?: string;
  created_at: string;
  last_login_at?: string;
  last_seen_at?: string;
  language?: string;
  active_sessions?: {
    id: number;
    device_type?: string;
    browser?: string;
    os?: string;
    ip_address?: string;
    created_at: string;
    last_active_at: string;
    expires_at: string;
  }[];
  total_activity?: number;
};

export type AdminReview = {
  id: string;
  name: string;
  location: string;
  crop: string;
  text: string;
  stars: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export type AdminAuditLog = {
  id: number;
  user_id?: number;
  activity_type: string;
  details: string;
  ip_address?: string;
  device_info?: string;
  logged_at: string;
};

export type AdminContent = {
  id: number;
  locale: string;
  key: string;
  value: string;
  is_published: boolean;
  updated_at: string;
};

export type AdminMedia = {
  id: number;
  filename: string;
  content_type: string;
  size_bytes: number;
  is_published: boolean;
  created_at: string;
};