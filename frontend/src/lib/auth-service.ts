import { loginUser, type LoginPayload } from "@/lib/api-client";

const TOKEN_KEY = "sulama_access_token";

export async function loginAndStoreToken(payload: LoginPayload): Promise<string> {
  const response = await loginUser(payload);
  const token = response.access_token;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  return token;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function clearStoredToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}
