export type RegisterPayload = {
  email: string;
  name: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002/api";

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await safeJson(response);
    const message = extractMessage(errorBody) || `Register request failed: ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await safeJson(response);
    const message = extractMessage(errorBody) || `Login request failed: ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

function extractMessage(errorBody: unknown): string | undefined {
  if (!errorBody || typeof errorBody !== "object") {
    return undefined;
  }

  if (!("message" in errorBody)) {
    return undefined;
  }

  const message = (errorBody as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
