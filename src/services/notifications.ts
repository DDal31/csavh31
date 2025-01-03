import { supabase } from "@/integrations/supabase/client";
import { SerializedPushSubscription } from "@/types/notifications";

const convertVapidKey = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const registerServiceWorker = async () => {
  try {
    console.log('Registering service worker...');
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    throw error;
  }
};

export const subscribeToPushNotifications = async (): Promise<PushSubscription | null> => {
  try {
    console.log('Starting push notification subscription process...');
    
    const registration = await registerServiceWorker();
    console.log('Service worker registration successful');
    
    await navigator.serviceWorker.ready;
    console.log('Service worker is ready');
    
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log('Already subscribed to push notifications');
      return subscription;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }
    console.log('Notification permission granted');

    const { data: { publicKey }, error: keyError } = await supabase.functions.invoke('get-vapid-key');
    if (keyError) {
      console.error('Error getting VAPID key:', keyError);
      throw keyError;
    }
    console.log('VAPID public key retrieved successfully');

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertVapidKey(publicKey)
    });
    console.log('Push notification subscription successful');

    const serializedSubscription: SerializedPushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh'))))),
        auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth')))))
      }
    };

    const { error: saveError } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        subscription: serializedSubscription as unknown as Json
      });

    if (saveError) {
      console.error('Error saving subscription to database:', saveError);
      throw saveError;
    }
    
    console.log('Successfully subscribed to push notifications');
    return subscription;

  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    throw error;
  }
};

export const unsubscribeFromPushNotifications = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('subscription', subscription);

      if (error) throw error;
      
      console.log('Successfully unsubscribed from push notifications');
    }
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    throw error;
  }
};
