import { get, getWithQueryParameters } from './fetch';
import { FeatureCollection } from 'geojson';
import { Survey, SurveyListItem } from '../models/models';

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
export const getAllSurveyData = (
  callback: (surveys: SurveyListItem[]) => void,
) => {
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
