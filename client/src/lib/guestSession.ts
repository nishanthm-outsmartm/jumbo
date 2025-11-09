const SESSION_KEY = "jj_guest_session_id";

const generateSessionId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `guest_${crypto.randomUUID()}`;
  }
  return `guest_${Math.random().toString(36).slice(2)}_${Date.now()}`;
};

export const getOrCreateGuestSessionId = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const clearGuestSessionId = () => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(SESSION_KEY);
};

export const peekGuestSessionId = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(SESSION_KEY);
};
