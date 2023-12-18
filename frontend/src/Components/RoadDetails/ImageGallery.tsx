import React, { useCallback, useEffect, useRef, useState } from 'react';
import ImageZoom from './ImageAbleZoom';
import { IImage } from '../../models/path';
import { getImagesForASurvey, getImagesForWays } from '../../queries/images';
import { useParams } from 'react-router-dom';
import { IRangeForDashCam } from '../../models/models';

interface Props {
  /** The distance from left to right displayed on surface images to display nearby dashcam images*/
  rangeDashCamImages?: IRangeForDashCam | null;
}
/**
 * React functional component for the Image Gallery of Dash Camera image.
 * Image gallery is for show the real road image, and user can scroll to check
 *
 * @author: Chen, Lyons
 */
const ImageGallery: React.FC<Props> = ({ rangeDashCamImages }) => {
  /** The id and type of the object to display (in the url) */
  const { id, type } = useParams();

  /** The reference to the gallery */
  const galleryRef = useRef<HTMLDivElement>(null);

  /** The current scroll position of the gallery */
  const [scrollPosition, setScrollPosition] = useState(0);

  /** Add feature for the pop-up of clicking and checking images */
  const [isImageClickOpen, setIsImageClickOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /** The images to display */
  const [cameraImages, setCameraImages] = useState<IImage[]>([]);

  // Fetch survey id from path
  useEffect(() => {
    // Check if survey id is defined
    if (id === undefined) return;

    if (type === 'surveys') {
      getImagesForASurvey(id, true, (images) => {
        setCameraImages(
          images.filter((image) => {
            if (rangeDashCamImages === undefined || rangeDashCamImages === null)
              return true;
            return (
              image.distance_survey >=
                (rangeDashCamImages.minRange - 5 > 0
                  ? rangeDashCamImages.minRange - 5
                  : 0) &&
              image.distance_survey <=
                (rangeDashCamImages.maxRange + 5 <
                rangeDashCamImages.maxRangeSurvey
                  ? rangeDashCamImages.maxRange + 5
                  : rangeDashCamImages.maxRangeSurvey)
            );
          }),
        );
      });
    } else if (type === 'paths') {
      getImagesForWays(id.split(','), true, (images) => {
        setCameraImages(images);
      });
    }
  }, [id, rangeDashCamImages]);

  // Function to open the pop-up
  const openImageInPopup = useCallback(
    (imageId: number) => {
      setCurrentImageIndex(imageId);
      setIsImageClickOpen(true);
    },
    [setCurrentImageIndex, setIsImageClickOpen],
  );

  const handleScroll = useCallback(
    (scrollOffset: number) => {
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
    },
    [setScrollPosition],
  );

  useEffect(() => {
    if (galleryRef.current) {
      galleryRef.current.scrollLeft = scrollPosition;
    }
  }, [scrollPosition]);

  return (
    <div className="image-gallery-container">
      <button
        className="arrow-button left-arrow"
        onClick={() => handleScroll(-200)}
      >
        &lt;
      </button>
      <div
        className="image-gallery-page"
        ref={galleryRef}
        style={{
          justifyContent: cameraImages.length <= 9 ? 'center' : 'flex-start',
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
      <button
        className="arrow-button right-arrow"
        onClick={() => handleScroll(200)}
      >
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
