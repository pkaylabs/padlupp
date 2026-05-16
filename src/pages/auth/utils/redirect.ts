const DEFAULT_AUTH_REDIRECT = "/goals";

const safeDecode = (value: string) => {
  let next = value.trim();

  for (let i = 0; i < 3; i += 1) {
    try {
      const decoded = decodeURIComponent(next);
      if (decoded === next) break;
      next = decoded;
    } catch {
      break;
    }
  }

  return next;
};

const extractGoalPreviewHref = (pathname: string, search: URLSearchParams) => {
  if (pathname !== "/goals") return null;

  const goalIdRaw = search.get("goal_id")?.trim() || "";
  if (!goalIdRaw) return null;

  if (
    goalIdRaw.includes("{") ||
    goalIdRaw.includes("}") ||
    goalIdRaw.includes("%7B") ||
    goalIdRaw.includes("%7D")
  ) {
    return null;
  }

  const goalId = safeDecode(goalIdRaw).trim();
  if (!goalId) return null;

  const sharedIdRaw = search.get("shared_id")?.trim() || "";
  const sharedId = safeDecode(sharedIdRaw).trim();
  const previewSearch = new URLSearchParams();
  if (sharedId) {
    previewSearch.set("shared_id", sharedId);
  }

  const encodedGoalId = encodeURIComponent(goalId);
  const nextSearch = previewSearch.toString();
  return nextSearch
    ? `/goals/${encodedGoalId}/preview?${nextSearch}`
    : `/goals/${encodedGoalId}/preview`;
};

export const resolvePostAuthRedirect = (
  rawRedirect?: string | null,
  origin?: string,
) => {
  if (!rawRedirect) return DEFAULT_AUTH_REDIRECT;

  const trimmed = safeDecode(rawRedirect);
  if (!trimmed) return DEFAULT_AUTH_REDIRECT;

  const baseOrigin =
    origin ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost");

  const prefixed = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)
    ? trimmed
    : trimmed.startsWith("/")
      ? trimmed
      : `/${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(prefixed, baseOrigin);
  } catch {
    return DEFAULT_AUTH_REDIRECT;
  }

  if (parsed.origin !== baseOrigin) return DEFAULT_AUTH_REDIRECT;

  if (parsed.pathname.startsWith("/signin")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  const sharedGoalPreviewHref = extractGoalPreviewHref(
    parsed.pathname,
    parsed.searchParams,
  );

  if (sharedGoalPreviewHref) return sharedGoalPreviewHref;

  return `${parsed.pathname}${parsed.search}${parsed.hash}` || DEFAULT_AUTH_REDIRECT;
};

