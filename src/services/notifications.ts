import { supabase } from "@/integrations/supabase/client";

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
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    throw error;
  }
};

export const subscribeToPushNotifications = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Get the current subscription
    let subscription = await registration.pushManager.getSubscription();
    
    // If already subscribed, return the existing subscription
    if (subscription) {
      console.log('Already subscribed to push notifications');
      return subscription;
    }

    // Request permission if not already granted
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Get VAPID key from Edge Function
    const { data: { publicKey }, error: keyError } = await supabase.functions.invoke('get-vapid-key');
    if (keyError) throw keyError;

    // Subscribe to push notifications
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertVapidKey(publicKey)
    });

    // Save subscription to database
    const { error: saveError } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        subscription: JSON.parse(JSON.stringify(subscription))
      });

    if (saveError) throw saveError;
    
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
      
      // Remove subscription from database
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