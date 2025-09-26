export function extractAuthToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)AdminAuthToken=([^;]+)/);
  return match ? match[1] : null;
}