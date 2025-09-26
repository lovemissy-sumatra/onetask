import type { LoginResultT } from "~/schema/Login.schema";

export async function loginUser(username: string, password: string): Promise<LoginResultT> {
  try {
    const response = await fetch('http://localhost:5024/api/adminauth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const userData = await response.json();
      return { success: true, user: userData };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Login failed' };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}