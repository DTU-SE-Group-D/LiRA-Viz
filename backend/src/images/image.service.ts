import { Injectable } from '@nestjs/common';
import { InjectConnection, Knex } from 'nestjs-knex';
import { IImage, Image, Way } from '../tables';
import { OSMWayId } from '../models';
import * as process from 'process';

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
    image.image_path = image.image_path
      .replace(process.env.IMAGE_STORE_PATH, '/cdn/')
      .replace('/home/fish/images/', '/cdn/');
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

  /**
   * Get the images for a given way
   *
   * @param wayId the way id
   * @param isDashCam boolean to indicate if the images are dash camera images or road surface images
   *
   * @author Kerbourc'h
   */
  async getWayImages(
    wayId: OSMWayId,
    isDashCam: boolean,
  ): Promise<{
    images: IImage[];
    length: number;
  }> {
    const way = (
      await Way(this.knex_groupd)
        .select('id', 'length')
        .where('osm_id', Number(wayId))
        .limit(1)
    )[0];

    if (way === undefined) return { images: [], length: 0 };

    const request = isDashCam
      ? Image(this.knex_groupd)
          .where('fk_way_id', way.id)
          .where('type', 'DashCamera')
          .orderBy('distance_way')
      : Image(this.knex_groupd)
          .where('fk_way_id', way.id)
          .whereNot('type', 'DashCamera')
          .orderBy('distance_way');

    return await request.then((data: IImage[]) => {
      if (!data) return { images: [], length: way.length };

      const length = way.length;

      return {
        images: data.map(this.formatImagePath),
        length: length,
      };
    });
  }
}
