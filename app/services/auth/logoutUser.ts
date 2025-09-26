export async function logoutUser(): Promise<void> {
  try {
    await fetch('http://localhost:5024/api/adminauth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout failed:', error);
  }
}