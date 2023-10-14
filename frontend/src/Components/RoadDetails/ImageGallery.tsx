import React, { useState, useRef, useEffect } from 'react';

interface Image {
  id: number;
  url: string;
}

const images: Image[] = [
  {
    id: 1,
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/43/2015-04-02_18_21_50_View_north_along_U.S._Route_95_in_the_Forty_Mile_Desert_of_Churchill_County%2C_Nevada.JPG',
  },
  {
    id: 2,
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/43/2015-04-02_18_21_50_View_north_along_U.S._Route_95_in_the_Forty_Mile_Desert_of_Churchill_County%2C_Nevada.JPG',
  },
  {
    id: 3,
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/43/2015-04-02_18_21_50_View_north_along_U.S._Route_95_in_the_Forty_Mile_Desert_of_Churchill_County%2C_Nevada.JPG',
  },
  {
    id: 4,
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/43/2015-04-02_18_21_50_View_north_along_U.S._Route_95_in_the_Forty_Mile_Desert_of_Churchill_County%2C_Nevada.JPG',
  },
  {
    id: 5,
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/43/2015-04-02_18_21_50_View_north_along_U.S._Route_95_in_the_Forty_Mile_Desert_of_Churchill_County%2C_Nevada.JPG',
  },
  {
    id: 6,
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/43/2015-04-02_18_21_50_View_north_along_U.S._Route_95_in_the_Forty_Mile_Desert_of_Churchill_County%2C_Nevada.JPG',
  },
  {
    id: 7,
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/43/2015-04-02_18_21_50_View_north_along_U.S._Route_95_in_the_Forty_Mile_Desert_of_Churchill_County%2C_Nevada.JPG',
  },
  {
    id: 8,
    url: 'https://hips.hearstapps.com/hmg-prod/images/1/roadbootie-main-1520457496.jpg?crop=0.848xw:1xh;center,top&resize=1200:*',
  },
  {
    id: 9,
    url: 'https://hips.hearstapps.com/hmg-prod/images/1/roadbootie-main-1520457496.jpg?crop=0.848xw:1xh;center,top&resize=1200:*',
  },
  {
    id: 10,
    url: 'https://hips.hearstapps.com/hmg-prod/images/1/roadbootie-main-1520457496.jpg?crop=0.848xw:1xh;center,top&resize=1200:*',
  },
  {
    id: 11,
    url: 'https://hips.hearstapps.com/hmg-prod/images/1/roadbootie-main-1520457496.jpg?crop=0.848xw:1xh;center,top&resize=1200:*',
  },
  {
    id: 12,
    url: 'https://hips.hearstapps.com/hmg-prod/images/1/roadbootie-main-1520457496.jpg?crop=0.848xw:1xh;center,top&resize=1200:*',
  },
  {
    id: 13,
    url: 'https://hips.hearstapps.com/hmg-prod/images/1/roadbootie-main-1520457496.jpg?crop=0.848xw:1xh;center,top&resize=1200:*',
  },
  {
    id: 14,
    url: 'https://hips.hearstapps.com/hmg-prod/images/1/roadbootie-main-1520457496.jpg?crop=0.848xw:1xh;center,top&resize=1200:*',
  },
  {
    id: 15,
    url: 'https://hips.hearstapps.com/hmg-prod/images/1/roadbootie-main-1520457496.jpg?crop=0.848xw:1xh;center,top&resize=1200:*',
  },
];

const ImageGallery: React.FC = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [centerImages, setCenterImages] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  const openImageInNewTab = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  const handleScroll = (scrollOffset: number) => {
    const newScrollPosition = scrollPosition + scrollOffset;
    const maxScrollLimit = (images.length - 11.4) * 120;

    const boundedScrollPosition = Math.max(
      0,
      Math.min(newScrollPosition, maxScrollLimit),
    );

    setScrollPosition(boundedScrollPosition);
  };

  useEffect(() => {
    const checkImagesWidth = () => {
      const galleryWidth = galleryRef.current?.offsetWidth || 0;
      let totalWidth = 0;

      const imageElements =
        galleryRef.current?.querySelectorAll('.image-thumbnail');
      imageElements?.forEach((imgElement) => {
        // Telling TypeScript that imgElement is an HTMLElement
        const img = imgElement as HTMLElement;
        totalWidth += img.offsetWidth;
      });

      if (totalWidth <= galleryWidth) {
        setCenterImages(true);
      } else {
        setCenterImages(false);
      }
    };

    checkImagesWidth();

    window.addEventListener('resize', checkImagesWidth);

    return () => {
      window.removeEventListener('resize', checkImagesWidth);
    };
  }, [images]);

  return (
    <div className="image-gallery-container">
      <div
        className={`image-gallery-page ${centerImages ? 'center-images' : ''}`}
        ref={galleryRef}
      >
        <div
          className="image-container"
          style={{ transform: `translateX(-${scrollPosition}px)` }}
        >
          {images.map((image) => (
            <img
              key={image.id}
              src={image.url}
              alt={`Image ${image.id}`}
              onClick={() => openImageInNewTab(image.url)}
              className="image-thumbnail"
            />
          ))}
        </div>
      </div>
      <button
        className={`arrow-button left-arrow ${
          scrollPosition === 0 ? 'disabled' : ''
        }`}
        onClick={() => handleScroll(-120)}
        disabled={scrollPosition === 0}
      >
        &#9668;
      </button>
      <button
        className={`arrow-button right-arrow ${
          scrollPosition === (images.length - 11.4) * 120 ? 'disabled' : ''
        }`}
        onClick={() => handleScroll(120)}
        disabled={scrollPosition === (images.length - 11.4) * 120}
      >
        &#9658;
      </button>
    </div>
  );
};

export default ImageGallery;
