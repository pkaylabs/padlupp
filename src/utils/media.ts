import { BASE_URL } from "@/constants";

const apiOrigin = (() => {
  try {
    return new URL(BASE_URL).origin;
  } catch {
    return "";
  }
})();

export const resolveMediaUrl = (value?: string | null) => {
  const source = value?.trim();
  if (!source) return "";

  const withHttpScheme = source
    .replace(/^wss:\/\//i, "https://")
    .replace(/^ws:\/\//i, "http://");

  if (/^(?:data:|blob:)/i.test(withHttpScheme)) return withHttpScheme;
  if (withHttpScheme.startsWith("//")) {
    return `${typeof window !== "undefined" ? window.location.protocol : "https:"}${withHttpScheme}`;
  }

  try {
    const url = new URL(withHttpScheme);
    if (
      url.protocol === "http:" &&
      apiOrigin.startsWith("https://") &&
      url.host === new URL(apiOrigin).host
    ) {
      url.protocol = "https:";
    }
    return url.toString();
  } catch {
    if (!apiOrigin) return withHttpScheme;
    return new URL(withHttpScheme.replace(/^\/+/, ""), `${apiOrigin}/`).toString();
  }
};
