"use client";

const USER_NAME_KEY = "user_name";

export function getUserName(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_NAME_KEY);
    if (!raw) return null;
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}

export function setUserName(name: string): boolean {
  if (typeof window === "undefined") return false;
  const trimmed = name.trim();
  if (!trimmed) return false;
  try {
    localStorage.setItem(USER_NAME_KEY, trimmed);
    return true;
  } catch {
    return false;
  }
}

