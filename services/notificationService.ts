
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

// SMS Notification Functions

interface SMSNotificationData {
  userName: string;
  userEmail: string;
  userPhone?: string;
  planTitle?: string;
  bookingDate?: string;
  action: 'booking' | 'plan_selection';
}

export const sendSMSNotification = async (data: SMSNotificationData): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('SMS notification failed:', result);
      return { success: false, error: result.error || 'Failed to send SMS' };
    }

    console.log('SMS notification sent successfully:', result);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending SMS notification:', error);
    return { success: false, error: error.message || 'Network error' };
  }
};

export const sendBookingSMS = async (userName: string, userEmail: string, userPhone?: string, bookingDate?: string) => {
  return sendSMSNotification({
    userName,
    userEmail,
    userPhone,
    bookingDate,
    action: 'booking'
  });
};

export const sendPlanSelectionSMS = async (userName: string, userEmail: string, planTitle: string, userPhone?: string) => {
  return sendSMSNotification({
    userName,
    userEmail,
    userPhone,
    planTitle,
    action: 'plan_selection'
  });
};

// Email Notification Functions

interface EmailNotificationData {
  userName: string;
  userEmail: string;
  userPhone?: string;
  planTitle?: string;
  bookingDate?: string;
  action: 'booking' | 'plan_selection';
}

export const sendEmailNotification = async (data: EmailNotificationData): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Email notification failed:', result);
      return { success: false, error: result.error || 'Failed to send email' };
    }

    console.log('Email notification sent successfully:', result);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending email notification:', error);
    return { success: false, error: error.message || 'Network error' };
  }
};

export const sendBookingEmail = async (userName: string, userEmail: string, userPhone?: string, bookingDate?: string) => {
  return sendEmailNotification({
    userName,
    userEmail,
    userPhone,
    bookingDate,
    action: 'booking'
  });
};

export const sendPlanSelectionEmail = async (userName: string, userEmail: string, planTitle: string, userPhone?: string) => {
  return sendEmailNotification({
    userName,
    userEmail,
    userPhone,
    planTitle,
    action: 'plan_selection'
  });
};
