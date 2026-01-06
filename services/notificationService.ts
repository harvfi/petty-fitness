
export const NOTIFICATION_KEY = 'pulse_notifications_enabled';

export const isNotificationSupported = () => {
  return 'Notification' in window;
};

export const getNotificationStatus = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) return false;

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    localStorage.setItem(NOTIFICATION_KEY, 'true');
    sendNotification('PULSE System Online', {
      body: 'You will now receive alerts for workouts and events.',
      icon: 'https://picsum.photos/seed/pulse-logo/128/128'
    });
    return true;
  }
  return false;
};

export const sendNotification = (title: string, options?: NotificationOptions) => {
  if (getNotificationStatus() === 'granted') {
    new Notification(title, {
      icon: 'https://picsum.photos/seed/pulse-logo/128/128',
      ...options
    });
  }
};

export const notifyTrainerPlanSelection = (clientName: string, planTitle: string) => {
  if (getNotificationStatus() === 'granted') {
    sendNotification('New Plan Selection', {
      body: `${clientName} selected the ${planTitle} plan`,
      icon: 'https://picsum.photos/seed/pulse-logo/128/128',
      tag: 'plan-selection'
    });
  }
};
