export interface SiteSettings {
  site_title: string;
  site_description: string;
  show_description: boolean;
  show_navigation: boolean;
  show_social_media: boolean;
  logo_url: string;
}

export interface SocialMediaLinks {
  twitter: { url: string; is_active: boolean };
  facebook: { url: string; is_active: boolean };
  instagram: { url: string; is_active: boolean };
}