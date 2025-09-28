import type { AlertData } from "~/providers/AlertProvider";


export function InlineAlertMessage({ type, title, description }: AlertData) {
  const colors = {
    success: "bg-green-100 text-green-700 border border-green-300",
    error: "bg-red-100 text-red-700 border border-red-300",
    warning: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    info: "bg-blue-100 text-blue-700 border border-blue-300",
  }[type];

  return (
    <div className={`p-3 rounded-md ${colors}`}>
      <strong>{title}</strong>
      {description && <p>{description}</p>}
    </div>
  );
}
