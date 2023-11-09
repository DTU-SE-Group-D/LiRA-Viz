import { Controller, Get, Query } from '@nestjs/common';

import { SurveyConditions } from 'src/models';
import { SurveyService } from './survey.service';

@Controller('conditions')
export class SurveyController {
  constructor(private readonly service: SurveyService) {}

  @Get('surveys')
  getWayConditions(
    @Query() query: { surveyId: string },
  ): Promise<SurveyConditions[]> {
    const { surveyId } = query;
    return this.service.getSurveyConditions(surveyId);
  }
}
