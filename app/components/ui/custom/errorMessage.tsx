export function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-red-400 text-[12px]">{message}</span>;
}