import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IImage, IImageValuesForPixels } from '../../models/models';
import { getRoadSurfaceImages } from '../../queries/images';

import '../../css/road_image.css';
import RotatedImage from './RotatedImage';

interface Props {
  type?: string;
  id?: string;
  selectedType: string;
  setImagesTypes: (types: string[]) => void;
  onRoadDistanceChange: (distanceValues: number[] | null) => void; // Function to receive roadDistanceLeftToRight
}

/**
 * this function gets the values in meters of the current distance of the road displayed on the images
 *
 * @param imagesValues the info of the images displayed
 *
 * @author Muro
 **/
function getRoadDistances(
  imagesValues: IImageValuesForPixels[],
): number[] | null {
  const imagesLength = imagesValues.length;
  const distances: number[] = [];

  if (imagesLength > 0) {
    //we consider all road images are the same size in meters
    const imageLengthMeters =
      imagesLength >= 2
        ? imagesValues[1].distanceSurvey - imagesValues[0].distanceSurvey
        : 2;

    distances[0] =
      imagesValues[0].distanceSurvey +
      ((imagesValues[0].firstVisiblePixelLeft - imagesValues[0].pixelLeft) /
        imagesValues[0].pixelWidth) *
        imageLengthMeters;
    distances[1] =
      imagesValues[imagesLength - 1].distanceSurvey +
      ((imagesValues[imagesLength - 1].lastVisiblePixelRight -
        imagesValues[imagesLength - 1].pixelLeft) /
        imagesValues[imagesLength - 1].pixelWidth) *
        imageLengthMeters;

    if (!isNaN(distances[0]) && !isNaN(distances[1])) {
      return distances;
    } else {
      return null;
    }
  }
  return null;
}

/**
 * Fetch and display the road images
 *
 * @param type
 * @param id
 * @param selectedType The type of image to display
 * @param setImagesTypes Callback to set the available types
 *
 * TODO: Find a way to load all the images
 *   - The importation could rotate the images (would reduce the load because of the rotation)
 *   - Display by batch of 25 images
 *
 * @author Kerbourc'h, Muro
 */
const RoadImage: React.FC<Props> = ({
  type,
  id,
  selectedType,
  setImagesTypes
  onRoadDistanceChange,
}) => {
  /** If the backend responded the data */
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  /** If the data has been filtered */
  const [hasFiltered, setHasFiltered] = useState<boolean>(false);
  /** All the images for a given survey */
  const [allImages, setAllImages] = useState<IImage[]>([]);
  /** The image of the selected type */
  const [displayedImages, setDisplayedImages] = useState<IImage[]>([]);
  /** The type of image to display */
  const containerRef = useRef(null);

  // load all the images for a given survey in allImages
  useEffect(() => {
    if (type !== 'surveys' || id === undefined) {
      setHasLoaded(true);
      setHasFiltered(true);
      return;
    }

    getRoadSurfaceImages(id, (images) => {
      setAllImages(images);
      setHasLoaded(true);
      setHasFiltered(false);
    });
  }, [id]);

  // filter the images using the selectedType and store it in displayedImages
  useEffect(() => {
    if (allImages.length === 0) return;

    setDisplayedImages(
      allImages.filter((image: IImage) => image.type === selectedType),
    );
    setHasFiltered(true);
    let availableTypes = allImages.map((image) => image.type.toString());
    availableTypes = Array.from(new Set(availableTypes));

    console.log('santi56', availableTypes);
    setImagesTypes(availableTypes);
  }, [allImages, selectedType]);

  // Scroll event handler
  const handleScroll = useCallback(() => {
    if (containerRef.current === null) return;

    const container = containerRef.current as HTMLElement;
    const containerRect = container.getBoundingClientRect();
    const images = container.querySelectorAll('.road-image-surface-image');
    const currentlyVisibleImagesForPixels: IImageValuesForPixels[] = [];

    images.forEach((image) => {
      const imageRect = image.getBoundingClientRect();
      if (
        imageRect.right >= containerRect.left &&
        imageRect.left <= containerRect.right
      ) {
        const imageId = image.getAttribute('data-image-id');
        const correspondingImage = displayedImages.find(
          (image) => image.id === imageId,
        );

        if (correspondingImage) {
          const roadSurfaceImageDivLeftPixel = containerRect.left;
          const roadSurfaceImageDivRightPixel = containerRect.right;

          currentlyVisibleImagesForPixels.push({
            id: correspondingImage.id,
            distanceSurvey: correspondingImage.distance_survey,
            pixelLeft: imageRect.left,
            pixelRight: imageRect.right,
            pixelWidth: imageRect.width,
            firstVisiblePixelLeft:
              imageRect.left < roadSurfaceImageDivLeftPixel
                ? roadSurfaceImageDivLeftPixel
                : imageRect.left,
            lastVisiblePixelRight:
              imageRect.right > roadSurfaceImageDivRightPixel
                ? roadSurfaceImageDivRightPixel
                : imageRect.right,
          });
        }
      }
    });
    onRoadDistanceChange(getRoadDistances(currentlyVisibleImagesForPixels));
  }, [containerRef, onRoadDistanceChange, displayedImages]);

  useEffect(() => {
    if (!hasFiltered) return;
    setTimeout(handleScroll, 1000);
  }, [hasFiltered]);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current as HTMLElement;
      const observer = new ResizeObserver(() => {
        // Handle size changes
        handleScroll();
      });
      // Start observing the container
      observer.observe(container);

      container.addEventListener('scroll', handleScroll);

      return () => {
        container.removeEventListener('scroll', handleScroll);
        observer.disconnect();
      };
    }
    return;
  }, [displayedImages, containerRef]);

  return (
    <div className="road-image">
      <div className="road-image-header-container">
        <div className="road-image-header">
          <p className="road-image-info" hidden={!(!hasLoaded || !hasFiltered)}>
            Loading images...
          </p>
          <p
            className="road-image-info"
            hidden={!(hasFiltered && displayedImages.length === 0)}
          >
            No images
          </p>
        </div>
      </div>
      <div className="border-road-image-surface-container">
        <div ref={containerRef} className="road-image-surface-container">
          {displayedImages.length > 0
            ? displayedImages.slice(0, 25).map((image) => (
                <div
                  key={'div' + image.id}
                  className="road-image-surface-image"
                  data-image-id={image.id}
                >
                  <RotatedImage key={image.id} src={image.image_path} />
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );
};

export default RoadImage;
