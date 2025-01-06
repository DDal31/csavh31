export const formatNotificationMessage = (
  template: string | null,
  defaultTemplate: string,
  replacements: Record<string, string>
): string => {
  let message = template || defaultTemplate;
  
  Object.entries(replacements).forEach(([key, value]) => {
    message = message.replace(`{${key}}`, value);
  });
  
  return message;
};

export const getDefaultNotificationSettings = async (supabaseClient: any) => {
  const { data: settings } = await supabaseClient
    .from('notification_settings')
    .select('*')
    .eq('enabled', true);
    
  return settings || [];
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
};

export const formatRelativeTime = (hours: number): string => {
  if (hours === 24) return "demain";
  if (hours === 48) return "après-demain";
  if (hours < 24) return `dans ${Math.round(hours)} heures`;
  return `dans ${Math.round(hours/24)} jours`;
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};