/* istanbul ignore file */
import type { User } from "../../services/api";

const STORAGE_KEYS = {
  currentUserId: "ricebook/currentUserId",
  customUsers: "ricebook/customUsers",
  headlines: "ricebook/headlines",
} as const;

const safeParseJSON = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("Failed to parse JSON from storage", error);
    return fallback;
  }
};

export const loadStoredCurrentUserId = (): number | null => {
  if (typeof localStorage === "undefined") {
    return null;
  }
  const value = localStorage.getItem(STORAGE_KEYS.currentUserId);
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const persistCurrentUserId = (userId: number | null) => {
  if (typeof localStorage === "undefined") {
    return;
  }
  if (userId === null) {
    localStorage.removeItem(STORAGE_KEYS.currentUserId);
  } else {
    localStorage.setItem(STORAGE_KEYS.currentUserId, String(userId));
  }
};

export const loadStoredCustomUsers = (): User[] => {
  if (typeof localStorage === "undefined") {
    return [];
  }
  return safeParseJSON<User[]>(
    localStorage.getItem(STORAGE_KEYS.customUsers),
    []
  );
};

export const persistCustomUsers = (users: User[]) => {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEYS.customUsers, JSON.stringify(users));
};

export const loadStoredHeadlines = (): Record<number, string> => {
  if (typeof localStorage === "undefined") {
    return {};
  }
  return safeParseJSON<Record<number, string>>(
    localStorage.getItem(STORAGE_KEYS.headlines),
    {}
  );
};

export const persistHeadlines = (headlines: Record<number, string>) => {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEYS.headlines, JSON.stringify(headlines));
};
