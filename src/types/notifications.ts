export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface WebPushSubscription {
  endpoint: string;
  keys: PushSubscriptionKeys;
}

export type SerializedPushSubscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}