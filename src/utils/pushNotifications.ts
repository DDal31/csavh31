import { WebPushSubscription, SerializedPushSubscription } from "@/types/notifications";
import { Json } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

export const handleApplePushError = async (
  error: any,
  subscription: WebPushSubscription,
  notificationData: any
) => {
  console.log("Handling Apple Push error:", error);
  
  try {
    const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
    console.log("Parsed error body:", errorBody);

    if (
      errorBody?.details?.includes("VAPID key mismatch") ||
      errorBody?.reason === "VapidPkHashMismatch"
    ) {
      console.log("VAPID key mismatch detected for Apple Push, attempting renewal");
      const renewed = await renewSubscription(subscription);
      
      if (renewed) {
        console.log("Subscription renewed successfully, retrying notification");
        return await sendPushNotification(renewed as WebPushSubscription, notificationData);
      }
    }
    
    return { error: errorBody };
  } catch (parseError) {
    console.error("Error parsing Apple Push error:", parseError);
    return { error };
  }
};

export const renewSubscription = async (subscription: WebPushSubscription) => {
  console.log("Starting subscription renewal for:", subscription.endpoint);
  
  try {
    const { data: vapidKey } = await supabase.functions.invoke('get-vapid-key');
    if (!vapidKey?.publicKey) {
      console.error("Failed to get VAPID public key");
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKey.publicKey
    });

    if (!newSubscription) {
      console.error("Failed to create new subscription");
      return false;
    }

    const serializedSubscription = serializeSubscription(newSubscription);
    console.log("Successfully created new subscription");
    
    return serializedSubscription;
  } catch (error) {
    console.error("Error during subscription renewal:", error);
    return false;
  }
};

export const serializeSubscription = (subscription: PushSubscription): SerializedPushSubscription => {
  if (!subscription.getKey) {
    throw new Error("Invalid subscription: missing getKey method");
  }

  const p256dhKey = subscription.getKey('p256dh');
  const authKey = subscription.getKey('auth');

  if (!p256dhKey || !authKey) {
    throw new Error("Invalid subscription: missing required keys");
  }

  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(p256dhKey)))),
      auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(authKey))))
    }
  };
};

export const sendPushNotification = async (
  subscription: WebPushSubscription,
  payload: any
) => {
  console.log("Sending push notification to:", {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh.substring(0, 10) + '...',
      auth: subscription.keys.auth.substring(0, 10) + '...'
    }
  });

  return await supabase.functions.invoke("send-push-notification", {
    body: { subscription, payload },
  });
};