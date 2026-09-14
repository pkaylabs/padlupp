type ApiErrorShape = {
  message?: unknown;
  response?: { data?: unknown };
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") return fallback;

  const apiError = error as ApiErrorShape;
  const data = apiError.response?.data;

  if (typeof data === "string" && data.trim()) return data;

  if (data && typeof data === "object") {
    for (const value of Object.values(data)) {
      if (typeof value === "string" && value.trim()) return value;
      if (Array.isArray(value)) {
        const firstMessage = value.find(
          (item): item is string => typeof item === "string" && Boolean(item.trim()),
        );
        if (firstMessage) return firstMessage;
      }
    }
  }

  if (typeof apiError.message === "string" && apiError.message.trim()) {
    return apiError.message;
  }

  return fallback;
}
