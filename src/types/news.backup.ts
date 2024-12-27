export interface Section {
  subtitle: string;
  content: string;
  imagePath?: string;
  imageFile?: File;
}

export interface ArticleFormData {
  title: string;
  mainImage?: File;
  mainImageUrl?: string;
  sections: Section[];
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  image_path?: string;
  published_at: string;
  author_id: string;
  status: 'draft' | 'published' | 'archived';
  sections?: Section[];
  author?: {
    first_name: string;
    last_name: string;
  };
}