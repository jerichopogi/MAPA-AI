import React from 'react';

// Array of image data for the gallery
const GALLERY_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Paris, France",
    caption: "Paris, France"
  },
  {
    src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Bali, Indonesia",
    caption: "Bali, Indonesia"
  },
  {
    src: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Venice, Italy",
    caption: "Venice, Italy"
  },
  {
    src: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Kyoto, Japan",
    caption: "Kyoto, Japan"
  },
  {
    src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Eiffel Tower",
    caption: "Eiffel Tower"
  },
  {
    src: "https://images.unsplash.com/photo-1493707553966-283afac8c358?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Santorini, Greece",
    caption: "Santorini, Greece"
  },
  {
    src: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Venice Canal",
    caption: "Venice Canal"
  },
  {
    src: "https://images.unsplash.com/photo-1549144511-f099e773c147?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Grand Canyon, USA",
    caption: "Grand Canyon, USA"
  },
  {
    src: "https://images.unsplash.com/photo-1528181304800-259b08848526?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Machu Picchu, Peru",
    caption: "Machu Picchu, Peru"
  },
  {
    src: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Tokyo, Japan",
    caption: "Tokyo, Japan"
  }
];

const InfiniteGallery: React.FC = () => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden p-3 hover:shadow-[0_20px_50px_rgba(64,169,188,0.3)] transition-all duration-500">
      <div className="gallery-scroll">
        <div className="gallery-scroll-inner">
          {/* First set of images */}
          <div className="columns-2 md:columns-3 gap-3 space-y-3">
            {GALLERY_IMAGES.map((image, index) => (
              <div 
                key={`img-${index}`}
                className="relative overflow-hidden rounded-lg shadow-md mb-3 hover:shadow-lg transition-all duration-300"
              >
                <img 
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <span className="text-white font-medium p-3">{image.caption}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Duplicate set for seamless infinite scroll */}
          <div className="columns-2 md:columns-3 gap-3 space-y-3 mt-3">
            {GALLERY_IMAGES.slice(0, 4).map((image, index) => (
              <div 
                key={`clone-${index}`}
                className="relative overflow-hidden rounded-lg shadow-md mb-3 hover:shadow-lg transition-all duration-300"
              >
                <img 
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <span className="text-white font-medium p-3">{image.caption}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfiniteGallery;