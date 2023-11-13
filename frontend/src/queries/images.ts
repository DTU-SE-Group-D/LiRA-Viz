import { IImage } from '../models/models';
import { get, getPath } from './fetch';

/**
 * This file provide function to fetch images data from the backend
 *
 * @param surveyId the survey id used to filter the images
 * @param callback the function called back when the request is responded
 *
 * @author Kerbourc'h
 */
export const getRoadSurfaceImages = (
  surveyId: string,
  callback: (images: IImage[]) => void,
) => {
  get('/images/road-surface/survey/' + surveyId, (data: IImage[]) => {
    callback(
      data.map((image) => {
        image.image_path = getPath(image.image_path);
        return image;
      }),
    );
  });
};
