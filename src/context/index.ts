import { useContext } from "react";
import { NotificationContext, NotificationProvider } from "./NotificaionContext";
const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export {
  useNotification,
  NotificationProvider,
  NotificationContext
}