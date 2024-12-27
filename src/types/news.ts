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