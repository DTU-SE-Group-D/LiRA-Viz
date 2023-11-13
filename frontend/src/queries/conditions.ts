import { get, post } from './fetch';
import { FeatureCollection } from 'geojson';
import { Survey } from '../models/models';

export const getSurveyData = (
  surveyId: string,
  setConditions: (data: Survey) => void,
) => {
  post('/surveys', { surveyId }, setConditions);
};

export const getAllConditions = (
  callback: (data: FeatureCollection) => void,
) => {
  get('/conditions', callback);
};
