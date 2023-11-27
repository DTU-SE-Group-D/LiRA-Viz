import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ImageService } from './image.service';
import { IImage } from '../tables';
import { OSMWayId } from '../models';

@Controller('images')
export class ImageController {
  constructor(private readonly service: ImageService) {}

  /**
   * Return the information of road surface images for a given survey
   *
   * @param surveyId the survey id
   *
   * @author Kerbourc'h
   */
  @Get('road-surface/survey/:id')
  async getRoadImagesOfASurvey(
    @Param('id') surveyId: string,
  ): Promise<IImage[]> {
    return await this.service.getRoadSurfaceImages(surveyId);
  }

  /**
   * Return the information of xf for a given survey
   *
   * @param surveyId the survey id
   *
   * @author Chen
   */
  @Get('dash-camera/survey/:id')
  async getDashCameraImages(@Param('id') surveyId: string): Promise<IImage[]> {
    return await this.service.getDashCameraImages(surveyId);
  }

  /**
   * Get the data indicators for specific consecutive ways.
   * @param type road-surface or dash-camera
   * @param wayIds the ways (osm) ids
   *
   * @author Kerbourc'h
   */
  @Post(':type/path')
  async getImagesForWays(
    @Param('type') type: string,
    @Body() wayIds: OSMWayId[],
  ) {
    const dataForWays = await Promise.all(
      wayIds.map((id: string) =>
        this.service.getWayImages(id, type === 'dash-camera'),
      ),
    );

    const data: IImage[] = [];

    let distanceFromBeginning = 0;

    for (let i = 0; i < dataForWays.length; i++) {
      data.push(
        ...dataForWays[i].images.map((image) => ({
          ...image,
          distance_way:
            i === 0
              ? image.distance_way
              : image.distance_way + distanceFromBeginning,
        })),
      );
      distanceFromBeginning += dataForWays[i].length;
    }

    return data;
  }
}
