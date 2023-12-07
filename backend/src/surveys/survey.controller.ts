import { Controller, Get, Query } from '@nestjs/common';

import { ISurvey } from 'src/models';
import { SurveyService } from './survey.service';

@Controller('surveys')
export class SurveyController {
  constructor(private readonly service: SurveyService) {}

  /**
   * @author Muro
   */
  @Get('')
  getWayConditions(@Query() query: { surveyId: string }): Promise<ISurvey> {
    const { surveyId } = query;
    return this.service.getSurveyConditions(surveyId);
  }

  /**
   * Fetches an array of all survey objects from the database.
   * Returns a Promise that resolves with the survey data.
   *
   * @author Lyons
   */
  @Get('all')
  getAllSurveys(): Promise<ISurvey[]> {
    return this.service.getAllSurveys();
  }
}
