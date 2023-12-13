import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IImage, IImageValuesForPixels } from '../../models/models';
import { getImagesForASurvey, getImagesForWays } from '../../queries/images';

import '../../css/road_image.css';
import RotatedImage from './RotatedImage';
import { useParams } from 'react-router-dom';

interface Props {
  /** The type of image to display */
  selectedType: string;
  /** Callback to set the available types */
  setImagesTypes: (types: string[]) => void;
  /** Callback describing the chunk of road displayed changes (to receive roadDistanceLeftToRight) */
  onRoadDistanceChange: (distanceValues: number[] | null) => void;
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
 * @param selectedType The type of image to display
 * @param setImagesTypes Callback to set the available types
 * @param onRoadDistanceChange Callback from when the chunk of road displayed changes
 *
 * TODO: Find a way to load all the images
 *   - The importation could rotate the images (would reduce the load because of the rotation)
 *   - Display by batch of 25 images
 *
 * @author Kerbourc'h, Muro
 */
const RoadImage: React.FC<Props> = ({
  selectedType,
  setImagesTypes,
  onRoadDistanceChange,
}) => {
  /** The id and type of the object to display (in the url) */
  const { id, type } = useParams();

  /** If the backend responded the data */
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  /** If the data has been filtered */
  const [hasFiltered, setHasFiltered] = useState<boolean>(false);
  /** All the images for a given survey */
  const [allImages, setAllImages] = useState<IImage[]>([]);
  /** The image of the selected type */
  const [displayedImages, setDisplayedImages] = useState<IImage[]>([]);

  const [indexLastViewed, setIndexLastViewed] = useState<number>(0);
  /** The type of image to display */
  const containerRef = useRef(null);

  // load all the images for a given survey in allImages
  useEffect(() => {
    if (
      type === undefined ||
      !['surveys', 'paths'].includes(type) ||
      id === undefined
    ) {
      setHasLoaded(true);
      setHasFiltered(true);
      return;
    }

    if (type === 'surveys') {
      getImagesForASurvey(id, false, (images) => {
        setAllImages(images);
        setHasLoaded(true);
        setHasFiltered(false);
      });
    } else {
      getImagesForWays(id.split(','), false, (images) => {
        setAllImages(images);
        setHasLoaded(true);
        setHasFiltered(false);
      });
    }
  }, [id]);

  // filter the images using the selectedType and store it in displayedImages
  useEffect(() => {
    if (allImages.length === 0) {
      setHasFiltered(true);
      return;
    }
    console.log('santi00 selectedType: ', selectedType);

    setDisplayedImages(
      allImages.filter((image: IImage) => image.type === selectedType),
    );
    setHasFiltered(true);
    let availableTypes = allImages.map((image) => image.type.toString());
    availableTypes = Array.from(new Set(availableTypes));

    setImagesTypes(availableTypes);
  }, [allImages, selectedType]);

  // Scroll event handler
  const handleScroll = useCallback(() => {
    if (containerRef.current === null) return;

    const container = containerRef.current as HTMLElement;
    const containerRect = container.getBoundingClientRect();
    const images = container.querySelectorAll('.road-image-surface-image');
    const currentlyVisibleImagesForPixels: IImageValuesForPixels[] = [];

    images.forEach((image, index) => {
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
            distanceSurvey:
              'paths' === type
                ? correspondingImage.distance_way
                : correspondingImage.distance_survey,
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
            absoluteIndex: index,
          });
        }
      }
    });

    console.log(
      'santi02 currentlyVisibleImagesForPixels: ',
      currentlyVisibleImagesForPixels,
    );

    if (currentlyVisibleImagesForPixels.length > 0) {
      console.log(
        'currentlyVisibleImagesForPixels[0].absoluteIndex',
        currentlyVisibleImagesForPixels[0].absoluteIndex,
      );
      setIndexLastViewed(currentlyVisibleImagesForPixels[0].absoluteIndex);
      console.log('santi03 indexLastViewed: ', indexLastViewed);
    }

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
            ? displayedImages.slice(0, 25).map((image, index) => (
                <div
                  key={'div' + image.id}
                  className="road-image-surface-image"
                  data-image-id={image.id}
                >
                  <RotatedImage
                    key={image.id}
                    src={image.image_path}
                    onLoad={() => {
                      if (index === indexLastViewed) {
                        setTimeout(() => {
                          if (containerRef.current === null) return;
                          const container = containerRef.current as HTMLElement;
                          container.children[index].scrollIntoView();
                        }, 20);
                      }
                    }}
                  />
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );
};

export default RoadImage;
