export const CLUB_LOGO_URL = "https://kzahxvazbthyjjzugxsy.supabase.co/storage/v1/object/public/site-assets/club-logo.png";

export const FALLBACK_LOGO_URL = "/club-logo-old.png";

export const getLogoUrl = (settingsLogoUrl?: string): string => {
  if (settingsLogoUrl) {
    try {
      const url = new URL(settingsLogoUrl);
      return url.toString();
    } catch (e) {
      console.log("Invalid logo URL in settings, using default:", e);
      return CLUB_LOGO_URL;
    }
  }
  return CLUB_LOGO_URL;
};