import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  categories: string[];
}

const BlogCard = ({
  id,
  title,
  excerpt,
  image,
  author,
  date,
  categories,
}: BlogCardProps) => {
  return (
    <Link to={`/actualites/${id}`} className="block" aria-label={`Voir l'article : ${title}`}>
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-gray-800 border-gray-700">
        <div className="relative">
          <AspectRatio ratio={16 / 9} className="bg-muted">
            <img
              src={image}
              alt={`Image illustrant l'article : ${title}`}
              className="object-contain w-full h-full"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = "/placeholder.svg";
              }}
            />
          </AspectRatio>
        </div>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
            <h3 className="text-2xl font-bold leading-tight line-clamp-2 text-gray-100">
              {title}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-3">
              {excerpt}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-700">
              <span>{author}</span>
              <time dateTime={date}>{date}</time>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BlogCard;