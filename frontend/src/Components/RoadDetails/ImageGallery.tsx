import React, { useState } from 'react';

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

  const openImageInNewTab = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  const handleScroll = (scrollOffset: number) => {
    const newScrollPosition = scrollPosition + scrollOffset;

    // Calculate the maximum scroll limit based on the total image width
    const maxScrollLimit = (images.length - 11.4) * 124; // 120 is the width of each image

    // Ensure the scroll stays within bounds
    const boundedScrollPosition = Math.max(
      0,
      Math.min(newScrollPosition, maxScrollLimit),
    );

    setScrollPosition(boundedScrollPosition);
  };

  return (
    <div className="image-gallery-container">
      <div className="image-gallery-page">
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
        &#9658;
      </button>
      <button
        className={`arrow-button right-arrow ${
          scrollPosition === (images.length - 1) * 124 ? 'disabled' : ''
        }`}
        onClick={() => handleScroll(120)}
        disabled={scrollPosition === (images.length - 1) * 124}
      >
        &#9658;
      </button>
    </div>
  );
};

export default ImageGallery;
