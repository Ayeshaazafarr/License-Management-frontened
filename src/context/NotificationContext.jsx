import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import "../components/Notification/Notification.css";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((current) =>
      current.filter(
        (notification) => notification.id !== id
      )
    );
  }, []);

  const notify = useCallback(
    (message, type = "error") => {
      const id = Date.now() + Math.random();

      setNotifications((current) => [
        ...current,
        {
          id,
          message,
          type,
        },
      ]);

      setTimeout(() => {
        removeNotification(id);
      }, 4000);
    },
    [removeNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        notify,
        removeNotification,
      }}
    >
      {children}

      <div className="notification-container">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification notification-${notification.type}`}
          >
            <div className="notification-content">

              <span className="notification-icon">
                {notification.type === "success"
                  ? "✓"
                  : notification.type === "warning"
                    ? "!"
                    : "×"}
              </span>

              <span className="notification-message">
                {notification.message}
              </span>

            </div>

            <button
              type="button"
              className="notification-close"
              onClick={() =>
                removeNotification(notification.id)
              }
            >
              ×
            </button>

          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification must be used inside NotificationProvider"
    );
  }

  return context;
}