import { useNotifications } from './NotificationProvider';

export function useNotify() {
  const { addNotification } = useNotifications();

  return {
    success: (message) => addNotification(message, 'success'),
    error: (message) => addNotification(message, 'error'),
    info: (message) => addNotification(message, 'info'),
    warning: (message) => addNotification(message, 'warning')
  };
}
