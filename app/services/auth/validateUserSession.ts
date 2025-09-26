import type { AuthResult } from "~/schema/Auth.schema";

export async function validateUserSession(request?: Request): Promise<AuthResult> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
    
    if (request && typeof window === 'undefined') {
      const cookieHeader = request.headers.get('Cookie');
      if (cookieHeader) {
        headers.Cookie = cookieHeader;
      }
    }

    const response = await fetch('http://localhost:5024/api/adminauth/validate-user', {
      method: 'GET',
      credentials: 'include', 
      headers,
    });

    if (response.ok) {
      const userData = await response.json();
      return { user: userData, success: true };
    }
    
    return { user: null, success: false };
  } catch (error) {
    console.error('Auth validation failed:', error);
    return { user: null, success: false };
  }
}