import type { AlertData } from "~/providers/AlertProvider";
import type { PrintJobT } from "~/schema/PrintJob.schema";

type InlineAlertMessageT = {
  alert: AlertData;
  printJob?: PrintJobT;
};

export function InlineAlertMessage({ alert, printJob }: InlineAlertMessageT) {
  const { type, title, description } = alert;

  const alertStyles = {
    success: {
      container: "bg-green-500/10 border border-green-500/20 rounded-lg p-3",
      text: "text-green-400 text-sm",
    },
    error: {
      container: "bg-red-500/10 border border-red-500/20 rounded-lg p-3",
      text: "text-red-400 text-sm",
    },
    warning: {
      container: "bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3",
      text: "text-yellow-400 text-sm",
    },
    info: {
      container: "bg-blue-500/10 border border-blue-500/20 rounded-lg p-3",
      text: "text-blue-400 text-sm",
    },
  };

  const statusStyles: Record<PrintJobT["status"], { container: string; text: string }> = {
    Pending: {
      container: "bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3",
      text: "text-yellow-400 text-sm",
    },
    Processing: {
      container: "bg-blue-500/10 border border-blue-500/20 rounded-lg p-3",
      text: "text-blue-400 text-sm",
    },
    Completed: {
      container: "bg-green-500/10 border border-green-500/20 rounded-lg p-3",
      text: "text-green-400 text-sm",
    },
    Cancelled: {
      container: "bg-red-500/10 border border-red-500/20 rounded-lg p-3",
      text: "text-red-400 text-sm",
    },
  };

  const statusMessages: Record<PrintJobT["status"], string> = {
    Pending: "Please pay to the counter.",
    Processing: "We are printing your print orders.",
    Completed: "You may now claim your prints.",
    Cancelled: "Print orders has been cancelled.",
  };

  const styles = printJob ? statusStyles[printJob.status] : alertStyles[type];
  const statusMessage = printJob ? statusMessages[printJob.status] : null;

  return (
    <div className={styles.container}>
      {printJob ? (
        statusMessage && <p className={`${styles.text} italic`}>{statusMessage}</p>
      ) : (
        <>
          {title && <p className={`${styles.text} font-medium`}>{title}</p>}
          {description && <p className={styles.text}>{description}</p>}
        </>
      )}
    </div>
  );
}
