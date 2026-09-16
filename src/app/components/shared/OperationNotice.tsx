import { useEffect } from "react";
import { toast, type NotificationKind } from "../../services/notifications";

/** Operation feedback belongs in toasts/history, not inside forms or cards. */
export function OperationNotice({ message, kind = "error" }: { message: string; kind?: NotificationKind }) {
  useEffect(() => { if (message) toast[kind](message); }, [message, kind]);
  return null;
}
