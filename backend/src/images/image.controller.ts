import { Controller, Get, Param } from '@nestjs/common';
import { ImageService } from './image.service';
import { IImage } from '../tables';

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
}
