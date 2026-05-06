import { AUTH_CONFIG } from "@/constants";
import type { AuthUser } from "@/types";

export const getStorageItem = async <T = unknown>(
  key: string,
  defaultValue: T | null = null,
): Promise<T | null> => {
  try {
    const item = localStorage.getItem(key);
    if (item !== null) {
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    }
    return defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const setStorageItem = async (key: string, value: unknown): Promise<boolean> => {
  try {
    const stringValue = typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
    return true;
  } catch (error) {
    console.warn(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
};

export const removeStorageItem = async (key: string): Promise<boolean> => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
    return false;
  }
};

export const clearStorageItems = async (keys: string[]): Promise<boolean> => {
  try {
    keys.forEach((key) => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.warn("Error clearing localStorage items:", error);
    return false;
  }
};

export const clearStorage = async (): Promise<boolean> => {
  try {
    const keys = [
      AUTH_CONFIG.ACCESS_TOKEN_STORAGE_KEY,
      AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
      AUTH_CONFIG.USER_STORAGE_KEY,
    ];
    keys.forEach((key) => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.warn("Error clearing auth storage:", error);
    return false;
  }
};

export const setAuthToken = async (token: string): Promise<boolean> => {
  return setStorageItem(AUTH_CONFIG.ACCESS_TOKEN_STORAGE_KEY, token);
};

export const getAuthToken = async (): Promise<string | null> => {
  return getStorageItem<string>(AUTH_CONFIG.ACCESS_TOKEN_STORAGE_KEY, null);
};

export const removeAuthToken = async (): Promise<boolean> => {
  return removeStorageItem(AUTH_CONFIG.ACCESS_TOKEN_STORAGE_KEY);
};

export const setUserData = async (userData: AuthUser): Promise<boolean> => {
  return setStorageItem(AUTH_CONFIG.USER_STORAGE_KEY, userData);
};

export const getUserData = async (): Promise<AuthUser | null> => {
  return getStorageItem<AuthUser>(AUTH_CONFIG.USER_STORAGE_KEY, null);
};

export const removeUserData = async (): Promise<boolean> => {
  return removeStorageItem(AUTH_CONFIG.USER_STORAGE_KEY);
};
