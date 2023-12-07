import { get, getWithQueryParameters } from './fetch';
import { FeatureCollection } from 'geojson';
import { Survey } from '../models/models';
import { SurveyList } from '../../../backend/src/models';

/**
 * @author Muro
 */
export const getSurveyData = (
  surveyId: string,
  setConditions: (data: Survey) => void,
) => {
  getWithQueryParameters('/surveys', { surveyId }, setConditions);
};

/**
 * Retrieves all survey data and passes it to the callback function.
 *
 * @author Lyons
 */
export const getAllSurveyData = (callback: (surveys: SurveyList) => void) => {
  get('/surveys/all', callback);
};

/**
 * @author LiraVis
 */
export const getAllConditions = (
  callback: (data: FeatureCollection) => void,
) => {
  get('/conditions', callback);
};
