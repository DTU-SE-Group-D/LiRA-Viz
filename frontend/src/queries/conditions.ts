import { SurveyConditions } from '../models/path';
import { get, post } from './fetch';
import { FeatureCollection } from 'geojson';

export const getConditionsSurvey = (
  surveyId: string,
  setConditions: (data: SurveyConditions[]) => void,
) => {
  post('/conditions/surveys', { surveyId }, setConditions);
};

export const getAllConditions = (
  callback: (data: FeatureCollection) => void,
) => {
  get('/conditions', callback);
};
