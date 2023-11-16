import React, { useState, useRef, useEffect } from 'react';
import ImageZoom from './ImageAbleZoom';
import { IImage } from '../../models/path';
import { GetDashCameraImage } from '../../queries/images';

interface Image {
  id: number;
  url: string;
}

// The fake images that need to be remove later
const images: Image[] = [];

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

  const [cameraImages, setCameraImages] = useState<IImage[]>([]);
  const surveyid = 'c8435e32-0627-46b9-90f6-52fc21862df3';

  useEffect(() => {
    GetDashCameraImage(surveyid, (images) => {
      setCameraImages(images);
    });
  }, []); // Empty dependency array to run only once on component mount

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

      {/* Put the images here temporarily to check if they are visible */}
      <div
        style={{
          textAlign: 'center',
          marginTop: 0,
          width: '100%',
          position: 'absolute',
          top: 0,
        }}
      >
        {cameraImages.map((image, index) => (
          <div key={index}>
            <img
              src={image.image_path}
              alt={`Camera Image ${index}`}
              style={{ width: '100%', height: 'auto' }} // Adjust the style as needed
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
