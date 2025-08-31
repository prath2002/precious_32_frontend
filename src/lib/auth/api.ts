import { LoginRequest, LoginResponse, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login/json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to login");
  }

  return response.json();
}

export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to get user information");
  }

  return response.json();
}
