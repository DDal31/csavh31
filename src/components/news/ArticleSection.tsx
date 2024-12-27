import { Section } from "@/types/news";

interface ArticleSectionProps {
  section: Section;
  index: number;
}

export const ArticleSection = ({ section, index }: ArticleSectionProps) => {
  const isEven = index % 2 === 0;
  const hasValidImage = section.imagePath && !section.imagePath.startsWith('blob:');

  return (
    <section 
      className={`flex flex-col lg:flex-row gap-8 items-center ${
        isEven ? "lg:flex-row" : "lg:flex-row-reverse"
      }`}
    >
      {hasValidImage && (
        <div className="lg:w-1/2">
          <img
            src={section.imagePath}
            alt={`Image illustrant la section : ${section.subtitle}`}
            className="rounded-lg object-cover w-full h-full"
          />
        </div>
      )}
      <div className={`${hasValidImage ? "lg:w-1/2" : "lg:w-full"}`}>
        {section.subtitle && (
          <h2 className="text-2xl font-bold mb-4">{section.subtitle}</h2>
        )}
        <div className="prose prose-invert">
          {section.content.split('\n').map((paragraph, pIndex) => (
            <p key={pIndex}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
};