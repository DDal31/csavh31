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
      className="bg-gray-800 rounded-lg border border-gray-700 p-8 mb-8"
      aria-labelledby={`section-${index}-heading`}
    >
      <div className={`flex flex-col lg:flex-row gap-8 items-center ${
        isEven ? "lg:flex-row" : "lg:flex-row-reverse"
      }`}>
        {hasValidImage && (
          <div className="lg:w-1/2">
            <img
              src={section.imagePath}
              alt={`Image illustrant la section : ${section.subtitle}`}
              className="rounded-lg object-contain w-full max-h-[600px] shadow-lg"
            />
          </div>
        )}
        <div className={`${hasValidImage ? "lg:w-1/2" : "w-full"}`}>
          {section.subtitle && (
            <h2 
              id={`section-${index}-heading`}
              className="text-2xl font-bold mb-6 text-gray-100"
            >
              {section.subtitle}
            </h2>
          )}
          <div className="prose prose-invert max-w-none">
            {section.content.split('\n').map((paragraph, pIndex) => (
              paragraph && (
                <p key={pIndex} className="text-gray-300 leading-relaxed mb-4">
                  {paragraph}
                </p>
              )
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};