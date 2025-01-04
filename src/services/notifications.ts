import { supabase } from "@/integrations/supabase/client";
import { requestNotificationPermission } from "@/config/firebase";

export const subscribeToPushNotifications = async () => {
  try {
    console.log('Starting Firebase notification subscription process...');
    const token = await requestNotificationPermission();
    
    if (!token) {
      throw new Error('Failed to get FCM token');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        subscription: { fcm_token: token }
      });

    if (error) throw error;
    console.log('Successfully subscribed to Firebase notifications');
    return token;
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    throw error;
  }
};

export const unsubscribeFromPushNotifications = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
    console.log('Successfully unsubscribed from notifications');
  } catch (error) {
    console.error('Error unsubscribing from notifications:', error);
    throw error;
  }
};