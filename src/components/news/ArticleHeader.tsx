import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ArticleHeaderProps {
  title: string;
  imagePath: string | null;
  publishedAt: string;
  author?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const ArticleHeader = ({ title, imagePath, publishedAt, author }: ArticleHeaderProps) => {
  return (
    <header className="text-center space-y-8 mb-12">
      <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-100 font-serif">
        {title}
      </h1>
      
      <div className="flex items-center justify-center space-x-4 text-gray-400 text-sm">
        {author && (
          <span className="flex items-center">
            <span className="sr-only">Auteur de l'article :</span>
            Par {author.first_name} {author.last_name}
          </span>
        )}
        <time dateTime={publishedAt} className="flex items-center">
          <span className="sr-only">Date de publication :</span>
          {format(new Date(publishedAt), "d MMMM yyyy", {
            locale: fr,
          })}
        </time>
      </div>

      {imagePath && !imagePath.startsWith('blob:') && (
        <div className="relative w-full max-w-4xl mx-auto">
          <img
            src={imagePath}
            alt={`Image principale illustrant l'article : ${title}`}
            className="w-full h-auto max-h-[600px] object-contain rounded-lg shadow-xl"
          />
        </div>
      )}
    </header>
  );
};