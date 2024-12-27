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
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";

export const NewsCarousel = () => {
  const [autoplayPlugin] = useState(() => 
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

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
    <div className="w-full aspect-[16/9] max-w-4xl mx-auto">
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        plugins={[autoplayPlugin]}
        className="w-full h-full"
      >
        <CarouselContent>
          {news.map((article) => (
            <CarouselItem key={article.id} className="w-full">
              <div className="w-full h-full px-2">
                <BlogCard
                  id={article.id}
                  title={article.title}
                  excerpt={article.content.substring(0, 150) + "..."}
                  image={article.image_path || "/placeholder.svg"}
                  author="CSAVH31"
                  date={new Date(article.published_at).toLocaleDateString()}
                  categories={["Actualité"]}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious 
          aria-label="Voir l'actualité précédente" 
          className="left-2"
        />
        <CarouselNext 
          aria-label="Voir l'actualité suivante" 
          className="right-2"
        />
      </Carousel>
    </div>
  );
};