interface AuthSession {
  token: string | null;
  sessionId: string | null;
}

export function isCurrentAuthRequest(
  authorization: unknown,
  requestSessionId: string | null | undefined,
  current: AuthSession,
): boolean {
  return Boolean(
    current.token &&
    authorization === `Token ${current.token}` &&
    requestSessionId === current.sessionId,
  );
}
