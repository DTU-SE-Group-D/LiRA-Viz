import React, { useEffect, useState } from 'react';
import { IImage } from '../../models/models';
import { getRoadSurfaceImages } from '../../queries/images';

import '../../css/road_image.css';
import RotatedImage from './RotatedImage';

interface Props {
  type?: string;
  id?: string;
  selectedType: string;
}

/**
 * Fetch and display the road images
 *
 * TODO: Find a way to load all the images
 *   - The importation could rotate the images (would reduce the load because of the rotation)
 *   - Display by batch of 25 images
 *
 * @author Kerbourc'h
 */
const RoadImage: React.FC<Props> = ({ type, id, selectedType }) => {
  /** If the backend responded the data */
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  /** If the data has been filtered */
  const [hasFiltered, setHasFiltered] = useState<boolean>(false);
  /** All the images for a given survey */
  const [allImages, setAllImages] = useState<IImage[]>([]);
  /** The image of the selected type */
  const [displayedImages, setDisplayedImages] = useState<IImage[]>([]);
  /** The type of image to display */

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
  }, [allImages, selectedType]);

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
      <div className="road-image-surface-container">
        {displayedImages.length > 0
          ? displayedImages.slice(0, 25).map((image) => (
              <div key={'div' + image.id} className="road-image-surface-image">
                <RotatedImage key={image.id} src={image.image_path} />
              </div>
            ))
          : null}
      </div>
    </div>
  );
};

export default RoadImage;
