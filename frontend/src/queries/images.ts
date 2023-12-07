/**
 * This file provide function to fetch images data from the backend
 */

import { IImage } from '../models/models';
import { get, getPath, post } from './fetch';

/**
 * @param surveyId the survey id used to filter the images
 * @param callback the function called back when the request is responded
 * @param isDashCam boolean to indicate if the images are dash camera images or road surface images
 *
 * @author Kerbourc'h, Chen
 */
export const getImagesForASurvey = (
  surveyId: string,
  isDashCam: boolean,
  callback: (images: IImage[]) => void,
) => {
  get(
    '/images/' +
      (isDashCam ? 'dash-camera' : 'road-surface') +
      '/survey/' +
      surveyId,
    (data: IImage[]) => {
      callback(
        data.map((image) => {
          image.image_path = getPath(image.image_path);
          return image;
        }),
      );
    },
  );
};

/**
 *
 * @param wayIds the way ids used to filter the images
 * @param isDashCam boolean to indicate if the images are dash camera images or road surface images
 * @param callback the function called back when the request is responded
 *
 * @author Kerbourc'h
 */
export const getImagesForWays = (
  wayIds: string[],
  isDashCam: boolean,
  callback: (images: IImage[]) => void,
) => {
  post(
    '/images/' + (isDashCam ? 'dash-camera' : 'road-surface') + '/path/',
    wayIds,
    (data: IImage[]) => {
      callback(
        data.map((image) => {
          image.image_path = getPath(image.image_path);
          return image;
        }),
      );
    },
  );
};
