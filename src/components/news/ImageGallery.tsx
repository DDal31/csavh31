interface ImageGalleryProps {
  images: Array<{
    url: string;
    title: string;
  }>;
}

export const ImageGallery = ({ images }: ImageGalleryProps) => {
  if (images.length === 0) return null;

  return (
    <section className="mt-16" aria-labelledby="gallery-heading">
      <h2 id="gallery-heading" className="text-2xl font-bold mb-8 text-gray-100">
        Galerie d'images
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <figure key={index} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <img
              src={image.url}
              alt={`${image.title}`}
              className="w-full h-48 object-cover rounded-lg mb-2"
            />
            <figcaption className="text-sm text-gray-400 text-center">
              {image.title}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};