import React, { useState, useRef, useEffect } from 'react';
import ImageZoom from './ImageAbleZoom';
import { IImage } from '../../models/path';
import { GetDashCameraImage } from '../../queries/images';
import { useParams } from 'react-router-dom';

interface Image {
  id: number;
  url: string;
}

export const images = (cameraImages: IImage[]): Image[] => {
  return cameraImages.map((ima, index) => ({
    id: index + 1,
    url: ima.image_path,
  }));
};

/**
 * React functional component for the Image Gallery of Dash Camera image.
 * Image gallery is for show the real road image, and user can scroll to check
 *
 * @author: Chen, Lyons
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
    handleScroll(-200);
  };

  const scrollRight = () => {
    handleScroll(200);
  };

  useEffect(() => {
    if (galleryRef.current) {
      galleryRef.current.scrollLeft = scrollPosition;
    }
  }, [scrollPosition]);

  const [cameraImages, setCameraImages] = useState<IImage[]>([]);
  // const surveyid = 'c8435e32-0627-46b9-90f6-52fc21862df3'; //Check the showing of image when surveyid fetch incorrectly
  const { id } = useParams<{ id?: string }>();
  // Fetch surveyid from path

  useEffect(() => {
    if (id) {
      // Check if surveyid is defined
      GetDashCameraImage(id, (images) => {
        setCameraImages(images);
      });
    }
  }, [id]);

  return (
    <div className="image-gallery-container">
      <button className="arrow-button left-arrow" onClick={scrollLeft}>
        &lt;
      </button>
      <div
        className="image-gallery-page"
        ref={galleryRef}
        style={{
          justifyContent: images.length <= 9 ? 'center' : 'flex-start',
        }}
      >
        {cameraImages.map((ima, index) => (
          <div
            className="image-container"
            key={index}
            onClick={() => openImageInPopup(index)}
          >
            <img
              className="image-thumbnail"
              src={ima.image_path}
              alt={`Gallery image ${index + 1}`}
            />
          </div>
        ))}
      </div>
      <button className="arrow-button right-arrow" onClick={scrollRight}>
        &gt;
      </button>
      {isImageClickOpen && (
        <ImageZoom
          imageUrl={cameraImages[currentImageIndex]?.image_path}
          onClose={() => setIsImageClickOpen(false)}
          onNavigate={(direction) => {
            setCurrentImageIndex((prevIndex) => {
              let newIndex = prevIndex + direction;
              // Ensure the new index is within the bounds of the cameraImages array
              newIndex = Math.max(
                0,
                Math.min(newIndex, cameraImages.length - 1),
              );
              return newIndex;
            });
          }}
          currentImageIndex={currentImageIndex}
          totalImages={cameraImages.length}
        />
      )}
    </div>
  );
};

export default ImageGallery;
