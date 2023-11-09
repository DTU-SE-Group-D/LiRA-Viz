import { Injectable } from '@nestjs/common';
import { InjectConnection, Knex } from 'nestjs-knex';
import { Measurement } from '../tables';
import { MeasurementType, SurveyConditions } from '../models';

@Injectable()
export class SurveyService {
  constructor(
    @InjectConnection('group-d') private readonly knex_group_d: Knex,
  ) {}

  /**
   * Query the data for a survey given his ID
   */
  async getSurveyConditions(surveyId: string): Promise<SurveyConditions[]> {
    return (
      await Measurement(this.knex_group_d)
        .select('type_index', 'value', 'distance_survey')
        .where('fk_survey_id', surveyId)
        .orderBy('distance_survey', 'asc')
    ).map(
      (value: {
        type_index: string;
        value: number;
        distance_survey: number;
      }) => {
        return {
          type: MeasurementType[value.type_index],
          value: value.value,
          distance_survey: value.distance_survey,
        };
      },
    );
  }
}
