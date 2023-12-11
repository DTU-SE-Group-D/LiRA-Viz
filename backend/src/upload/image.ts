import { SurveyImage, SurveyStructure } from './upload';
import { readdirSync } from 'fs';
import { join } from 'path';

/**
 * Asynchronously processes and uploads image data from HDC folders to a database.
 * This function scans the HDC folder for JPEG files, each representing a road image.
 * It matches each image file with its corresponding XML file to extract metadata
 
 * @param {SurveyStructure} survey - The survey structure containing information about the survey.
 * @param {boolean} debug - A boolean flag to enable debug logging.
 * @returns {SurveyImage[]} - An array of `SurveyImage` objects representing the processed road images with extracted metadata.
 * @author Liu, Kerbourc'h
 */
export function extract_road_image_data(
  survey: SurveyStructure,
  debug: boolean,
): SurveyImage[] {
  try {
    let images: SurveyImage[] = [];

    const jpgFiles = readdirSync(survey.HDC).filter((file) =>
      file.endsWith('.jpg'),
    );
    const fk_survey_id = survey.fk_survey_id;

    // Iterate over all JPG images
    for (const jpgFile of jpgFiles) {
      const match = jpgFile.match(
        /Lcms(Survey|Result)_(\d+)?_?(.*?)_([0-9]+)\.jpg/,
      );
      if (match) {
        const surveyId = match[2];
        const sequenceNumber = match[4];
        const type = match[3];

        // Build the corresponding XML filename (considering with or without surveyid)
        const xmlFileName = surveyId
          ? `Lcms${match[1]}_${surveyId}_${sequenceNumber}.xml`
          : `Lcms${match[1]}_${sequenceNumber}.xml`;

        const xml = survey.XMLs.find((xml) => xml.path.endsWith(xmlFileName));
        if (xml) {
          const imageFullPath = join(survey.HDC, jpgFile);
          const startDistance = xml.distance;
          const date = xml.date;

          images.push({
            distance_survey: startDistance,
            image_path: imageFullPath,
            type: type,
            timestamp: date,
          });

          if (debug) {
            console.log('-----------------------------------');
            console.log('Processing folder: ' + survey.HDC);
            console.log('Survey ID for current folder: ' + fk_survey_id);
            console.log('Image file being processed: ' + jpgFile);
            console.log('Type from image file name: ' + type);
            console.log('Start distance from XML: ' + startDistance);
            console.log('Date from XML: ' + date);
          }
        }
      }
    }

    return images;
  } catch (error) {
    console.error('Error uploading image data:', error);
    return null;
  }
}

/**
 * Asynchronously processes and uploads DashCamera image data from a collection of camera folders to a database.
 * @param {SurveyStructure} survey - The survey structure containing information about the survey.
 * @param {boolean} debug - A boolean flag to enable debug logging.
 * @returns {SurveyImage[]} - An array of `SurveyImage` objects representing the processed road images with extracted metadata.
 * @author Liu, Kerbourc'h
 */
export function extract_dashcam_image_data(
  survey: SurveyStructure,
  debug: boolean,
): SurveyImage[] {
  try {
    let images: SurveyImage[] = [];

    const type = 'DashCamera';

    for (const camFolder of survey.Cams) {
      const files = readdirSync(camFolder);
      const jpgFiles = files.filter(
        (file) =>
          file.endsWith('.jpg') ||
          file.endsWith('.JPG') ||
          file.endsWith('.Jpg'),
      );

      for (const jpgFile of jpgFiles) {
        const match = jpgFile.match(/^.*\s+(\d+\.?\d*)\s+(\d+)\.jpg$/i);
        if (match) {
          const startDistance = Number(match[1]) * 1000; // convert in meters

          images.push({
            distance_survey: startDistance,
            image_path: join(camFolder, jpgFile),
            type: type,
            timestamp: survey.XMLs[0].date,
          });

          if (debug) {
            console.log('-----------------------------------');
            console.log('Processing DashCamera folder: ' + camFolder);
            console.log('Image file being processed: ' + jpgFile);
            console.log(
              'Start distance extracted from file name: ' + startDistance,
            );
          }
        }
      }
    }

    // fix the fact that sometimes the distance is kilometers and something in meters
    let minStrictPositiveDistance = Math.min(
      ...images
        .map((image) => image.distance_survey)
        .filter((distance) => distance > 0),
    );

    return minStrictPositiveDistance / 1000 < 0.2
      ? images
      : images.map((image) => ({
          ...image,
          distance_survey: image.distance_survey / 1000,
        }));
  } catch (error) {
    console.error('Error uploading DashCamera data:', error);
    return null;
  }
}
