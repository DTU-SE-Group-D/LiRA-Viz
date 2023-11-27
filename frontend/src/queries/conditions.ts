import { get, post } from './fetch';
import { FeatureCollection } from 'geojson';
import { Survey } from '../models/models';

export const getSurveyData = (
  surveyId: string,
  setConditions: (data: Survey) => void,
) => {
  post('/surveys', { surveyId }, setConditions);
};

export const getAllSurveyData = (callback: (surveys: Survey[]) => void) => {
  get('/surveys/all', callback);
};

export const getAllConditions = (
  callback: (data: FeatureCollection) => void,
) => {
  get('/conditions', callback);
};
