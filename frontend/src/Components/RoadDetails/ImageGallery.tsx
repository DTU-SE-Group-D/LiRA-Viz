import React, { useState, useRef, useEffect } from 'react';
import ImageZoom from './ImageAbleZoom';

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

/**
 * React functional component for the Image Gallery.
 * Image gallery is for show the real road image, and user can scroll to check
 */
const ImageGallery: React.FC = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Add feature for the pop-up of clicking and checking images
  const [isImageClickOpen, setIsImageClickOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Function to open the pop-up
  const openImageInPopup = (imageId: number) => {
    setCurrentImageIndex(imageId - 1); // Adjust for 0-based index
    setIsImageClickOpen(true);
  };

  const handleScroll = (scrollOffset: number) => {
    if (!galleryRef.current) return;

    const currentScroll = galleryRef.current.scrollLeft;
    const maxScrollLimit =
      galleryRef.current.scrollWidth - galleryRef.current.clientWidth;

    const newScrollPosition = currentScroll + scrollOffset;
    const boundedScrollPosition = Math.max(
      0,
      Math.min(newScrollPosition, maxScrollLimit),
    );

    setScrollPosition(boundedScrollPosition);
  };

  const scrollLeft = () => {
    handleScroll(-600);
  };

  const scrollRight = () => {
    handleScroll(600);
  };

  useEffect(() => {
    if (galleryRef.current) {
      galleryRef.current.scrollLeft = scrollPosition;
    }
  }, [scrollPosition]);

  return (
    <div className="image-gallery-container">
      <button className="arrow-button left-arrow" onClick={scrollLeft}>
        &lt;
      </button>
      <div
        className="image-gallery-page"
        ref={galleryRef}
        style={{ justifyContent: images.length <= 9 ? 'center' : 'flex-start' }}
      >
        {images.map((image) => (
          <div className="image-container" key={image.id}>
            <img
              className="image-thumbnail"
              src={image.url}
              alt="Gallery Thumbnail"
              onClick={() => openImageInPopup(image.id)}
            />
          </div>
        ))}
      </div>
      <button className="arrow-button right-arrow" onClick={scrollRight}>
        &gt;
      </button>
      {isImageClickOpen && (
        <ImageZoom
          imageUrl={images[currentImageIndex].url}
          onClose={() => setIsImageClickOpen(false)}
          onNavigate={(direction) => {
            // Handle navigation here if needed
            if (direction === -1) {
              // Navigate to the previous image
              setCurrentImageIndex((prevIndex) => prevIndex - 1);
            } else if (direction === 1) {
              // Navigate to the next image
              setCurrentImageIndex((prevIndex) => prevIndex + 1);
            }
          }}
          currentImageIndex={currentImageIndex}
          totalImages={images.length}
        />
      )}
    </div>
  );
};

export default ImageGallery;
