export interface SiteSettings {
  site_title: string;
  site_description: string;
  show_description: boolean;
  show_navigation: boolean;
  show_social_media: boolean;
  logo_url: string;
  logo_shape: string;
}

export interface SocialMediaLinks {
  twitter: SocialMediaLink;
  facebook: SocialMediaLink;
  instagram: SocialMediaLink;
}

export interface SocialMediaLink {
  url: string;
  is_active: boolean;
}