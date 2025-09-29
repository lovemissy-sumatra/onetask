import React, { createContext, useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";

type AlertType = "success" | "error" | "warning" | "info";

export type AlertData = {
  type: AlertType;
  title: string;
  description?: string;
  referenceCode?: string;
};

type AlertContextType = {
  alert: AlertData | null;
  showAlert: (alert: AlertData) => void;
  clearAlert: () => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alert, setAlert] = useState<AlertData | null>(null);

  const showAlert = (alert: AlertData) => setAlert(alert);
  const clearAlert = () => setAlert(null);

  return (
    <AlertContext.Provider value={{ alert, showAlert, clearAlert }}>
      {children}

      <Dialog open={!!alert} onOpenChange={clearAlert}>
        <DialogContent className="dark">
          {alert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span>
                    {alert.type === "success" && "✅"}
                    {alert.type === "error" && "❌"}
                    {alert.type === "warning" && "⚠️"}
                    {alert.type === "info" && "ℹ️"}
                  </span>
                  {alert.title}
                </DialogTitle>
                {alert.description && (
                  <DialogDescription>{alert.description}</DialogDescription>
                )}
              </DialogHeader>

              <DialogFooter>
                <Button onClick={clearAlert}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
