import { api } from "@/lib/api";
import axios from "axios";
import type { ChatMessage } from "@/pages/app/messages/api";

export interface Achievement { id: number; key: string; name: string }
export interface Person { id: number; name: string; avatar: string | null; title?: string; achievements?: Achievement[] }
export interface HQUser extends Person { group_creation_approved: boolean }
export interface Category { id: number; name: string }
export interface Member { id: number; user: Person; role: string; state: string; joined_at: string; muted_until?: string | null; inactivity_review?: { id: number; last_login_at: string } | null }
export interface GroupInvitation {
  id: number; user: Person | null; invited_by: Person | null; role: string;
  status: "pending" | "revoked"; created_at: string; expires_at: string; is_link: boolean; url: string | null;
}
export interface GroupInviteLink { id: number; url: string; token: string; expires_at: string }
export type PostType = "text" | "link" | "image" | "video" | "document" | "poll" | "task";
export interface Group {
  id: number; name: string; description: string; category: Category; image: string | null;
  visibility: "public" | "private"; status: string; conversation_id: number | null; member_count: number; admin_count: number;
  membership: { role: string; state: string; muted_until?: string | null; notifications_muted?: boolean } | null;
  can_manage: boolean; can_moderate: boolean; can_post: boolean; joins_paused: boolean;
  rules: string[]; post_permissions: Record<PostType, boolean>; creator: Person; created_at: string;
}
export interface CommunityContext { is_internal: boolean; can_create: boolean; categories: Category[]; invitations: { id: number; group_id: number; group_name: string; role: string; token: string; expires_at: string }[]; task_invitations?: Task[] }
export interface Poll { id: number; question: string; multiple_answers: boolean; options: { id: number; text: string; votes: Person[] }[] }
export interface Message extends ChatMessage {
  can_delete_everyone: boolean; can_moderate: boolean; is_pinned: boolean; deletion_kind: string | null;
  reactions: { emoji: string; user: Person }[]; poll: Poll | null;
  links?: string[];
}
export interface Task {
  id: number; group: number; goal_id: number; pod_id: number; conversation_id: number; title: string; description: string;
  category: Category | number | string; start_date: string; target_date: string; invitation_deadline: string;
  member_limit: number; member_count: number; visibility: string; status: string; enrollment_status: string;
  can_manage: boolean; can_join: boolean; progress: number; cover: string | null; checkin_frequency: string;
  members: Member[]; milestones: { id?: number; title: string; due_at: string; completed?: boolean }[];
  membership: { role: string; state: string } | null; invitation_status?: string; approval_required: boolean;
  milestone_completion?: { completed: number; total: number }; checkin_participation?: { submitted: number; total: number };
}
export interface JoinRequest { id: number; user: Person; created_at?: string; state?: string }
export interface Audit { id: number; action: string; reason?: string; outcome?: string; actor?: Person | null; created_at: string; target_type?: string; target_id?: number }
export interface Report { id: number; reason: string; details?: string; status: string; target_type?: string; group?: number; task?: number; message?: number; reported_user?: Person | number; reporter?: Person; text?: string; created_at: string; allowed_actions?: string[] }
export interface Evidence { id: number; user?: Person; goal_id?: number; name?: string; created_at?: string }
export interface HQ { groups: Group[]; reports: Report[]; audit: Audit[]; creators: { user: Person; approved: boolean }[]; evidence: Evidence[] }
export interface Page<T> { results: T[]; count: number; next: string | null; previous: string | null }
export function page<T>(data: Page<T> | T[]): Page<T> {
  return Array.isArray(data) ? { results: data, count: data.length, next: null, previous: null } : data;
}
export function nextPage(url: string | null) { return url ? Number(new URL(url, window.location.origin).searchParams.get("page") || 1) : undefined; }
export function isAccessError(error: unknown) { return axios.isAxiosError(error) && [401, 403, 404].includes(error.response?.status || 0); }
export function errorText(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data;
    if (typeof body === "string" && !body.includes("<html")) return body.slice(0, 400);
    if (body && typeof body === "object") return Object.entries(body).map(([key, value]) => `${key === "detail" ? "" : `${key}: `}${Array.isArray(value) ? value.join(" ") : typeof value === "string" ? value : JSON.stringify(value)}`).join(" ");
    return error.response?.status === 403 ? "Your access has changed. Refresh this view to check your permissions." : "Unable to connect. Please try again.";
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
export const community = {
  get: async <T,>(path: string, params?: Record<string, unknown>) => (await api.get<T>(`/community/${path}`, { params })).data,
  post: async <T = unknown,>(path: string, data?: unknown) => (await api.post<T>(`/community/${path}`, data)).data,
  patch: async <T = unknown,>(path: string, data?: unknown) => (await api.patch<T>(`/community/${path}`, data)).data,
  list: async <T,>(path: string, params?: Record<string, unknown>) => page((await api.get<Page<T> | T[]>(`/community/${path}`, { params })).data),
  attachment: async (id: number, signal?: AbortSignal) => (await api.get<Blob>(`/community/messages/${id}/attachment/`, { responseType: "blob", signal })).data,
  cover: async (id: number, signal?: AbortSignal) => (await api.get<Blob>(`/community/tasks/${id}/cover/`, { responseType: "blob", signal })).data,
  reportAttachment: async (id: number, signal?: AbortSignal) => (await api.get<Blob>(`/community/messages/${id}/report-evidence/`, { params: { file: 1 }, responseType: "blob", signal })).data,
  conversationResources: async (id: number, type: string, pageNumber: number) => page((await api.get<Page<Message> | Message[]>(`/conversations/${id}/resources/`, { params: { type, page: pageNumber } })).data),
};
export function multipart(values: Record<string, unknown>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null || value === "") continue;
    form.append(key, value instanceof Blob ? value : typeof value === "object" ? JSON.stringify(value) : String(value));
  }
  return form;
}
