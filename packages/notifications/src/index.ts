// Firebase Cloud Messaging for push notifications only
// Note: Using FCM for push notifications, NOT for authentication
// Authentication is handled via SENS (phone OTP), Kakao, Naver, and Apple OAuth

import admin from 'firebase-admin';

let appInitialized = false;

function ensureApp() {
  if (!appInitialized && process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      appInitialized = true;
    } catch (error) {
      console.warn('Firebase not configured - push notifications disabled');
    }
  }
}

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushNotification(token: string, payload: PushPayload) {
  if (!appInitialized) {
    ensureApp();
  }

  if (!appInitialized) {
    console.warn('Push notification skipped - Firebase not configured');
    return;
  }

  try {
    await admin.messaging().send({
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
    });
  } catch (error) {
    console.error('Failed to send push notification:', error);
    throw error;
  }
}
