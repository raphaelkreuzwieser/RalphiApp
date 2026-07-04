/**
 * Handgepflegte TypeScript-Typen zum Supabase-Schema (supabase/schema.sql).
 * Quelle der Wahrheit ist das SQL-Schema – diese Typen 1:1 dazu halten.
 * (Können später via `supabase gen types typescript` ersetzt werden.)
 */

export type SubmissionStatus = "pending" | "approved" | "rejected";
export type EventSubStatus = "pending" | "confirmed" | "rejected";
export type FriendshipStatus = "pending" | "accepted" | "blocked";
export type UserRole = "user" | "admin";

export interface Profile {
  id: string;
  username: string;
  full_name: string; // privat, nur Admin
  bundesland: string | null;
  country_id: string;
  birthdate: string; // privat, nur Admin
  phone: string | null; // privat, nur Admin
  role: UserRole;
  locked: boolean;
  share_location: boolean;
  created_at: string;
}

export interface Country {
  id: string;
  name: string;
  flag: string;
  active: boolean;
  sort: number;
}

export interface Drink {
  id: string;
  name: string;
  image_url: string | null;
  active: boolean;
  sort: number;
}

export interface ReactionTemplate {
  id: string;
  text: string;
  active: boolean;
  sort: number;
}

export interface Submission {
  id: string;
  user_id: string;
  country_id: string;
  time_seconds: number;
  video_path: string | null;
  status: SubmissionStatus;
  video_public: boolean;
  via_event: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface EventRow {
  id: string;
  name: string;
  admin_id: string;
  created_by: string;
  active: boolean;
  created_at: string;
}

export interface EventSubmission {
  id: string;
  event_id: string;
  user_id: string;
  time_seconds: number;
  has_video: boolean;
  video_path: string | null;
  status: EventSubStatus;
  official_submission_id: string | null;
  created_at: string;
}

export interface Friendship {
  id: string;
  requester: string;
  addressee: string;
  status: FriendshipStatus;
  created_at: string;
}

export interface Checkin {
  id: string;
  user_id: string;
  drink_id: string | null;
  drink_name: string;
  location_text: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface CheckinReaction {
  id: string;
  checkin_id: string;
  user_id: string;
  text: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

/** View: public.ranking (nur Username, nie echter Name) */
export interface RankingRow {
  id: string;
  username: string;
  country_id: string;
  time_seconds: number;
  video_public: boolean;
  created_at: string;
}

/** View: public.event_ranking */
export interface EventRankingRow {
  id: string;
  event_id: string;
  username: string;
  time_seconds: number;
  has_video: boolean;
  status: EventSubStatus;
  created_at: string;
}
