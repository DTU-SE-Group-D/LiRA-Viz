import { Injectable } from '@nestjs/common';
import { InjectConnection, Knex } from 'nestjs-knex';
import { IImage, Image } from '../tables';

@Injectable()
export class ImageService {
  constructor(
    @InjectConnection('group-d') private readonly knex_groupd: Knex,
  ) {}

  /**
   * Change the path so that given the domain name and port of the backend server
   * the frontend can find the right image
   *
   * @param image the image to process
   *
   * @author Kerbourc'h
   */
  formatImagePath(image: IImage) {
    image.image_path = image.image_path.replace('/home/fish/images/', '/cdn/');
    return image;
  }

  /**
   * Return the information of road surface images for a given survey
   *
   * @param surveyId the survey id
   *
   * @author Kerbourc'h
   */
  async getRoadSurfaceImages(surveyId: string) {
    return (
      await Image(this.knex_groupd)
        .select()
        .where('fk_survey_id', surveyId)
        .whereNot('type', 'DashCamera')
        .orderBy('distance_survey')
    ).map(this.formatImagePath);
  }

  /**
   * Return the information of dash carema images for a given survey
   *
   * @param surveyId the survey id
   *
   * @author Kerbourc'h, Chen
   */
  async getDashCameraImages(surveyId: string) {
    return (
      await Image(this.knex_groupd)
        .select()
        .where('fk_survey_id', surveyId)
        .andWhere('type', 'DashCamera')
        .orderBy('distance_survey')
    ).map(this.formatImagePath);
  }
}
