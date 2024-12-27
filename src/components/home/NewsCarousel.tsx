import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import BlogCard from "@/components/BlogCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const NewsCarousel = () => {
  const { data: news, isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      console.log("Fetching news...");
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching news:", error);
        throw error;
      }

      console.log("Fetched news:", data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div 
        className="flex justify-center items-center h-24" 
        role="status" 
        aria-label="Chargement des actualités"
      >
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
        <span className="sr-only">Chargement des actualités en cours...</span>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <p className="text-center text-gray-400">
        Aucune actualité disponible pour le moment.
      </p>
    );
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {news.map((article) => (
          <CarouselItem key={article.id} className="md:basis-1/2 lg:basis-1/3">
            <BlogCard
              title={article.title}
              excerpt={article.content.substring(0, 150) + "..."}
              image={article.image_path || "/placeholder.svg"}
              author="CSAVH31"
              date={new Date(article.published_at).toLocaleDateString()}
              categories={["Actualité"]}
              slug={article.id}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious aria-label="Voir l'actualité précédente" />
      <CarouselNext aria-label="Voir l'actualité suivante" />
    </Carousel>
  );
};