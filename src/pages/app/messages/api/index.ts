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

export interface ReplyToInfo {
  id: number;
  sender_name: string;
  text: string | null;
  attachment_name?: string | null;
  attachment_mime?: string | null;
}

export interface ChatMessage {
  id: number;
  conversation: number;
  sender: ChatUser;
  text: string | null;
  attachment: string | null;
  attachment_name: string | null;
  attachment_mime: string | null;
  attachment_size: number | null;
  is_read: boolean;
  reply_to_message_id: number | null;
  reply_to: ReplyToInfo | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  partnership: number;
  partner_name?: string | null;
  partner_avatar?: string | null;
  is_group: boolean;
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
  reply_to_message_id?: number | null;
}

export interface UpdateMessagePayload {
  conversation?: number;
  text?: string;
}

export interface GetConversationMediaParams {
  page?: number;
  page_size?: number;
}

export interface ConversationMediaItem {
  id: number;
  file?: string | null;
  attachment?: string | null;
  attachment_name?: string | null;
  attachment_mime?: string | null;
  attachment_size?: number | null;
  created_at: string;
  sender_id?: number | null;
  sender_name?: string | null;
  sender?: Partial<ChatUser> | null;
}

type ConversationMediaResponse = PaginatedResponse<ConversationMediaItem> | ConversationMediaItem[];

const normalizeConversationMediaResponse = (
  payload: ConversationMediaResponse | null | undefined,
): PaginatedResponse<ConversationMediaItem> => {
  if (Array.isArray(payload)) {
    return {
      count: payload.length,
      next: null,
      previous: null,
      results: payload,
    };
  }

  if (payload && Array.isArray(payload.results)) {
    return {
      count: typeof payload.count === "number" ? payload.count : payload.results.length,
      next: payload.next ?? null,
      previous: payload.previous ?? null,
      results: payload.results,
    };
  }

  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
};

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

export const renameGroupConversation = async (
  id: number,
  payload: { name: string },
): Promise<Conversation> => {
  const { data } = await api.post<Conversation>(
    `/conversations/${id}/rename-group/`,
    payload,
  );
  return data;
};

export const getConversationMedia = async (
  id: number,
  params?: GetConversationMediaParams,
) => {
  const { data } = await api.get<ConversationMediaResponse>(
    `/conversations/${id}/media/`,
    { params },
  );
  return normalizeConversationMediaResponse(data);
};
