import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';

export const initializePushNotifications = async () => {
  try {
    // Check if notifications are supported in this environment
    const notificationsSupported = "Notification" in window && "serviceWorker" in navigator;
    console.log('Notifications supported:', notificationsSupported);

    // Check if we're on a native platform
    const platform = Capacitor.getPlatform();
    console.log('Current platform:', platform);

    if (platform === 'web') {
      console.log('Using web push notifications');
      return await initializeWebPushNotifications();
    } else {
      console.log('Using native push notifications');
      return await initializeNativePushNotifications();
    }
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    throw error;
  }
};

const initializeWebPushNotifications = async () => {
  if (!('Notification' in window)) {
    console.log('Web Notifications not supported');
    return false;
  }

  // Check if it's iOS using a more reliable method
  const isIOS = /iPad|iPhone|iPod/.test(navigator.platform) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  console.log('Is iOS device:', isIOS);

  if (isIOS) {
    // Check if the website is in standalone mode (added to home screen)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    console.log('Is standalone PWA:', isStandalone);

    if (!isStandalone) {
      console.log('iOS requires adding the site to home screen for notifications');
      return false;
    }
  }

  const permission = await Notification.requestPermission();
  console.log('Web notification permission:', permission);
  return permission === 'granted';
};

const initializeNativePushNotifications = async () => {
  const result = await PushNotifications.requestPermissions();
  console.log('Push notification permission result:', result);

  if (result.receive === 'granted') {
    await PushNotifications.register();
    console.log('Push notification registered');
    return true;
  } else {
    console.log('Push notification permission denied');
    return false;
  }
};

export const addPushNotificationListeners = () => {
  if (Capacitor.getPlatform() === 'web') {
    console.log('Web platform - no native listeners needed');
    return;
  }

  PushNotifications.addListener('registration', async (token) => {
    console.log('Push registration success:', token.value);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
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

  PushNotifications.addListener('registrationError', (error) => {
    console.error('Error on registration:', error);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received:', notification);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push notification action performed:', notification);
  });
};