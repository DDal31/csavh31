export interface Section {
  subtitle: string;
  content: string;
  imagePath?: string;
  imageFile?: File;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  image_path: string | null;
  published_at: string;
  author: {
    first_name: string;
    last_name: string;
  } | null;
  sections?: Section[];
}

export interface ArticleFormData {
  title: string;
  mainImage: File | null;
  mainImageUrl?: string;
  sections: Section[];
}