import { useEffect, useState } from 'react';
import { X, AlertTriangle, Info, CheckCircle, Bell, Settings } from 'lucide-react';
import { useNotificationStore, type Notification } from '@/store/useNotificationStore';

const typeConfig = {
  info: {
    bg: 'bg-tech-blue/10',
    border: 'border-tech-blue/40',
    icon: Info,
    iconColor: 'text-tech-blue',
    titleColor: 'text-tech-blue',
  },
  warning: {
    bg: 'bg-status-warning/10',
    border: 'border-status-warning/40',
    icon: AlertTriangle,
    iconColor: 'text-status-warning',
    titleColor: 'text-status-warning',
  },
  danger: {
    bg: 'bg-status-alarm/10',
    border: 'border-status-alarm/40',
    icon: Bell,
    iconColor: 'text-status-alarm',
    titleColor: 'text-status-alarm',
  },
  success: {
    bg: 'bg-status-normal/10',
    border: 'border-status-normal/40',
    icon: CheckCircle,
    iconColor: 'text-status-normal',
    titleColor: 'text-status-normal',
  },
};

function NotificationItem({ notification }: { notification: Notification }) {
  const { removeNotification } = useNotificationStore();
  const [isVisible, setIsVisible] = useState(false);
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      removeNotification(notification.id);
      notification.onClose?.();
    }, 300);
  };

  return (
    <div
      className={`
        max-w-sm w-full p-4 rounded-lg backdrop-blur-sm
        border ${config.border} ${config.bg}
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${notification.type === 'danger' ? 'alarm-blink' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg shrink-0 ${config.bg}`}>
          <Icon size={20} className={config.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${config.titleColor}`}>{notification.title}</h4>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white shrink-0 ml-2"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-gray-300 text-sm mt-1">{notification.message}</p>
          {notification.showActions && notification.onAction && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  notification.onAction?.();
                  handleClose();
                }}
                className="px-3 py-1.5 bg-tech-blue/20 text-tech-blue rounded text-sm hover:bg-tech-blue/30 transition-colors flex items-center gap-1"
              >
                <Settings size={14} />
                {notification.actionLabel || '查看详情'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationContainer() {
  const { notifications } = useNotificationStore();

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 pointer-events-none">
      <div className="pointer-events-auto space-y-3">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}
