import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface BlogCardProps {
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  categories: string[];
  slug: string;
}

const BlogCard = ({
  title,
  excerpt,
  image,
  author,
  date,
  categories,
  slug,
}: BlogCardProps) => {
  return (
    <Link to={`/actualites/${slug}`}>
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          <AspectRatio ratio={16 / 9} className="bg-muted">
            <img
              src={image}
              alt={title}
              className="object-cover object-top w-full h-full"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = "/placeholder.svg";
              }}
            />
          </AspectRatio>
        </div>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex gap-2 mb-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
            <h3 className="text-xl font-bold leading-tight line-clamp-2">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {excerpt}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
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