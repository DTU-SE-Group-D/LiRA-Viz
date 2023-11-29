import { get, post } from './fetch';
import { FeatureCollection } from 'geojson';
import { Survey } from '../models/models';
import { SurveyList } from '../../../backend/src/models';

export const getSurveyData = (
  surveyId: string,
  setConditions: (data: Survey) => void,
) => {
  post('/surveys', { surveyId }, setConditions);
};

/**
 * Retrieves all survey data and passes it to the callback function.
 *
 * @author Lyons
 */
export const getAllSurveyData = (callback: (surveys: SurveyList) => void) => {
  get('/surveys/all', callback);
};

export const getAllConditions = (
  callback: (data: FeatureCollection) => void,
) => {
  get('/conditions', callback);
};
