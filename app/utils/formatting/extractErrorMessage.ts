export function extractErrorMessage(err: any, fallback: string): string {
  if (err.response?.data) {
    if (typeof err.response.data === "string") {
      return err.response.data;
    }
    if (err.response.data.message) {
      return err.response.data.message;
    }
  }
  return fallback;
}
