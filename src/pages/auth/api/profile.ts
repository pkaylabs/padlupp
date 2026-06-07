import { api } from "@/lib/api";

// --- Domain Models ---

export interface User {
  id: number;
  email: string;
  phone: string;
  name: string;
  avatar: string;
  phone_verified: boolean;
  email_verified: boolean;
  preferred_notification_email: string;
  preferred_notification_phone: string;
  notify_on_new_message: boolean;
  notify_on_new_match: boolean;
  notify_on_reminders: boolean;
}

export interface UserProfile {
  id: number;
  user: User;
  bio: string;
  location: string;
  experience: string;
  interests: string; // Note: API response says string, but update payload sends array
  time_zone: string;
  focus_areas: string;
  availability: string;
  communication_styles: string;
  created_at: string;
  updated_at: string;
}

// --- Request Payloads ---

// Endpoint 2 Payload
export interface UpdateExperiencePayload {
  experience: string;
  interests: string[]; // Sent as array
}

// Endpoint 3 Payload
export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  preferred_notification_email?: string;
  preferred_notification_phone?: string;
}

// Endpoint 4 Payload
export interface UpdateProfilePayload {
  bio?: string;
  location?: string;
  experience?: string;
  interests?: string; // Sent as string here based on your schema? Or array?
  // *Assuming string based on schema provided in prompt #4*
  time_zone?: string;
  focus_areas?: string;
  availability?: string;
  communication_styles?: string;
}

// Endpoint 5 Payload
export interface UpdateAvatarPayload {
  avatar: File;
}

export interface DeleteAccountPayload {
  reason: string;
}

export interface NotificationPreferencesPayload {
  notify_on_new_message?: boolean;
  notify_on_new_match?: boolean;
  notify_on_reminders?: boolean;
}

// --- API Functions ---

// 1. GET Full Profile
export const getUserProfile = async (): Promise<UserProfile> => {
  const { data } = await api.get<UserProfile>("/auth/userprofile/");
  return data;
};

// 2. PATCH Experience & Interests
export const updateExperience = async (
  payload: UpdateExperiencePayload,
): Promise<UserProfile> => {
  const { data } = await api.patch<UserProfile>(
    "/onboarding/update-experience/",
    payload,
  );
  return data;
};

// 3. PATCH User Account Details (Name, Phone, etc.)
export const updateUserAccount = async (
  payload: UpdateUserPayload,
): Promise<User> => {
  const { data } = await api.patch<User>("/auth/user/", payload);
  return data;
};

// 4. PATCH Extended Profile Details (Bio, Location, etc.)
export const updateExtendedProfile = async (
  payload: UpdateProfilePayload,
): Promise<UserProfile> => {
  const { data } = await api.patch<UserProfile>(
    "/onboarding/profile/",
    payload,
  );
  return data;
};

// 5. POST User Avatar
export const updateUserAvatar = async (
  payload: UpdateAvatarPayload,
): Promise<User> => {
  const formData = new FormData();
  formData.append("avatar", payload.avatar);

  const { data } = await api.patch<User>("/onboarding/user-avatar/", formData);
  return data;
};

export const deleteAccount = async (
  payload: DeleteAccountPayload,
): Promise<void> => {
  await api.post("/auth/delete-account/", payload);
};

// 6. PATCH Notification Preferences
export const updateNotificationPreferences = async (
  payload: NotificationPreferencesPayload,
): Promise<void> => {
  await api.patch("/auth/notification-preferences/", payload);
};
