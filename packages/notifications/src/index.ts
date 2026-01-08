// Expo Push Notifications
// Using Expo's push notification service for React Native apps

const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: 'default' | null;
  badge?: number;
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: {
    error?: string;
  };
}

interface ExpoPushResponse {
  data: ExpoPushTicket[];
}

export async function sendPushNotification(
  token: string,
  payload: PushPayload
): Promise<{ success: boolean; ticketId?: string; error?: string }> {
  try {
    const response = await fetch(EXPO_PUSH_API_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        sound: payload.sound ?? 'default',
        badge: payload.badge,
      }),
    });

    if (!response.ok) {
      console.error('Expo Push API request failed:', response.status, response.statusText);
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const result = (await response.json()) as ExpoPushResponse;
    const ticket = result.data[0];

    if (ticket.status === 'ok') {
      return { success: true, ticketId: ticket.id };
    }

    console.error('Failed to send push notification:', ticket.message);
    return { success: false, error: ticket.message };
  } catch (error) {
    console.error('Failed to send push notification:', error);
    throw error;
  }
}
