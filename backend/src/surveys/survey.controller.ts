import { Controller, Get, Query } from '@nestjs/common';

import { Survey } from 'src/models';
import { SurveyService } from './survey.service';

@Controller('surveys')
export class SurveyController {
  constructor(private readonly service: SurveyService) {}

  @Get('')
  getWayConditions(@Query() query: { surveyId: string }): Promise<Survey> {
    const { surveyId } = query;
    return this.service.getSurveyConditions(surveyId);
  }
}