export interface ColorScheme {
  primary: string;
  background: string;
  card: string;
  muted: string;
}

export interface LayoutConfig {
  tileLayout: string;
  logoPosition: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  style: "default" | "modern" | "minimal" | "playful" | "professional";
  color_scheme: ColorScheme;
  layout_config: LayoutConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}