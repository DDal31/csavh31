import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';

export const initializePushNotifications = async () => {
  try {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    const result = await PushNotifications.requestPermissions();
    
    console.log('Push notification permission result:', result);

    if (result.receive === 'granted') {
      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();
      console.log('Push notification registered');
    } else {
      console.log('Push notification permission denied');
    }
  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
};

// Add listeners for push notifications
export const addPushNotificationListeners = () => {
  // On registration success
  PushNotifications.addListener('registration', async (token) => {
    console.log('Push registration success:', token.value);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Store the token in your database
        const { error } = await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: session.user.id,
            subscription: { token: token.value }
          });

        if (error) throw error;
        console.log('Push token saved to database');
      }
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  });

  // On registration error
  PushNotifications.addListener('registrationError', (error) => {
    console.error('Error on registration:', error);
  });

  // On push notification received
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received:', notification);
  });

  // On push notification action clicked
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push notification action performed:', notification);
  });
};