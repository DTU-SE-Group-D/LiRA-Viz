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
  async getImagesOfASurvey(@Param('id') surveyId: string): Promise<IImage[]> {
    return await this.service.getRoadSurfaceImages(surveyId);
  }

  /**
   * Return the information of a given image
   *
   * @param imageId the image id
   *
   * @author Kerbourc'h
   */
  @Get(':id')
  async getImage(@Param() imageId: string): Promise<IImage[]> {
    return await this.service.getImage(imageId);
  }
}
