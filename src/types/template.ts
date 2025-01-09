export interface Template {
  id: string;
  name: string;
  description: string;
  theme: 'light' | 'dark';
  layout: 'classic' | 'modern' | 'minimal';
  primaryColor: string;
  secondaryColor: string;
  preview_image: string;
}

export const templates: Template[] = [
  {
    id: 'classic-light',
    name: 'Classique Clair',
    description: 'Design traditionnel avec une mise en page claire et épurée',
    theme: 'light',
    layout: 'classic',
    primaryColor: '#4169E1',
    secondaryColor: '#F1F1F1',
    preview_image: '/templates/classic-light.jpg'
  },
  {
    id: 'classic-dark',
    name: 'Classique Sombre',
    description: 'Design traditionnel avec un thème sombre élégant',
    theme: 'dark',
    layout: 'classic',
    primaryColor: '#4169E1',
    secondaryColor: '#1A1F2C',
    preview_image: '/templates/classic-dark.jpg'
  },
  {
    id: 'modern-light',
    name: 'Moderne Clair',
    description: 'Design contemporain avec des éléments visuels modernes',
    theme: 'light',
    layout: 'modern',
    primaryColor: '#9b87f5',
    secondaryColor: '#F6F6F7',
    preview_image: '/templates/modern-light.jpg'
  },
  {
    id: 'modern-dark',
    name: 'Moderne Sombre',
    description: 'Design contemporain avec un thème sombre sophistiqué',
    theme: 'dark',
    layout: 'modern',
    primaryColor: '#9b87f5',
    secondaryColor: '#221F26',
    preview_image: '/templates/modern-dark.jpg'
  },
  {
    id: 'minimal-light',
    name: 'Minimaliste Clair',
    description: 'Design épuré avec une emphase sur le contenu',
    theme: 'light',
    layout: 'minimal',
    primaryColor: '#0EA5E9',
    secondaryColor: '#FFFFFF',
    preview_image: '/templates/minimal-light.jpg'
  },
  {
    id: 'minimal-dark',
    name: 'Minimaliste Sombre',
    description: 'Design épuré avec un thème sombre minimaliste',
    theme: 'dark',
    layout: 'minimal',
    primaryColor: '#0EA5E9',
    secondaryColor: '#222222',
    preview_image: '/templates/minimal-dark.jpg'
  }
];