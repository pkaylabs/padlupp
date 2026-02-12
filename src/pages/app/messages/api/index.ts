import { api } from "@/lib/api";

export interface ChatUser {
  id: number;
  email: string;
  phone: string;
  name: string;
  avatar: string;
  phone_verified: boolean;
  email_verified: boolean;
  preferred_notification_email: string;
  preferred_notification_phone: string;
}

export interface ChatMessage {
  id: number;
  conversation: number;
  sender: ChatUser;
  text: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  partnership: number;
  partner_name?: string | null;
  partner_avatar?: string | null;
  last_message: ChatMessage | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface GetMessagesParams {
  page?: number;
  search?: string;
  ordering?: string;
  conversation?: number;
}

export interface CreateMessagePayload {
  conversation: number;
  text: string;
}

export interface UpdateMessagePayload {
  conversation?: number;
  text?: string;
}

export const getMessages = async (
  params: GetMessagesParams,
): Promise<PaginatedResponse<ChatMessage>> => {
  const { data } = await api.get<PaginatedResponse<ChatMessage>>("/messages/", {
    params,
  });
  return data;
};

export const createMessage = async (
  payload: CreateMessagePayload,
): Promise<ChatMessage> => {
  const { data } = await api.post<ChatMessage>("/messages/", payload);
  return data;
};

export const getMessage = async (id: string | number): Promise<ChatMessage> => {
  const { data } = await api.get<ChatMessage>(`/messages/${id}/`);
  return data;
};

export const putMessage = async (
  id: string | number,
  payload: UpdateMessagePayload,
): Promise<ChatMessage> => {
  const { data } = await api.put<ChatMessage>(`/messages/${id}/`, payload);
  return data;
};

export const patchMessage = async (
  id: string | number,
  payload: UpdateMessagePayload,
): Promise<ChatMessage> => {
  const { data } = await api.patch<ChatMessage>(`/messages/${id}/`, payload);
  return data;
};

export const deleteMessage = async (id: string | number): Promise<void> => {
  await api.delete(`/messages/${id}/`);
};
