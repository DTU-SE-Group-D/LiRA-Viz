import { Injectable } from '@nestjs/common';
import { InjectConnection, Knex } from 'nestjs-knex';
import { Measurement, Survey } from '../tables';
import { ISurvey, MeasurementType, SurveyListItem } from '../models';

@Injectable()
export class SurveyService {
  constructor(
    @InjectConnection('group-d') private readonly knex_group_d: Knex,
  ) {}

  /**
   * Query the data for a survey given his ID
   *
   * @author Muro, Kerbourc'h
   */
  async getSurveyConditions(surveyId: string): Promise<ISurvey> {
    const s: ISurvey[] = (
      await Measurement(this.knex_group_d)
        .select(
          this.knex_group_d.raw(
            'ST_AsGeoJSON(section_geom)::json as section_geom',
          ),
          this.knex_group_d.raw(
            "json_agg(json_build_object('type_index', type_index,'value', value, 'distance', distance_survey)) as data",
          ),
        )
        .join('survey', 'survey.id', 'measurement.fk_survey_id')
        .where('fk_survey_id', surveyId)
        .groupBy(this.knex_group_d.raw('fk_survey_id, section_geom'))
    ).map(
      (survey: {
        section_geom: { type: string; coordinates: number[][] };
        data: {
          type_index: number;
          value: number;
          distance: number;
        }[];
      }) => {
        return {
          id: surveyId,
          geometry: survey.section_geom.coordinates[0],
          data: survey.data
            .map((value) => {
              return {
                type: MeasurementType[value.type_index],
                value: value.value,
                distance: value.distance,
              };
            })
            .sort((a, b) => a.distance - b.distance),
        };
      },
    );

    return s.length > 0 ? s[0] : null;
  }

  /**
   * Asynchronously retrieves all surveys from the database, including their IDs and timestamps.
   *
   * @author Lyons, Kerbourc'h
   */
  async getAllSurveys(): Promise<SurveyListItem[]> {
    return Survey(this.knex_group_d)
      .select(
        'id',
        'timestamp',
        this.knex_group_d.raw('ST_AsGeoJSON(section_geom)::json as geometry'),
        'survey_id as dynatest_id',
      )
      .then((result) =>
        result.map((survey) => ({
          ...survey,
          geometry: survey.geometry.coordinates[0],
        })),
      );
  }
}
