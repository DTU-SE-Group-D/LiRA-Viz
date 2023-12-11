import { LatLng } from '../models';
import {
  count_cracks,
  count_mmo,
  count_potholes,
  count_sealed_cracks,
  get_date,
  get_roughness,
  get_start,
  get_surveyID,
  whats_available,
} from './xml';
import { parse } from 'papaparse';
import { existsSync, lstatSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export interface SurveyData {
  // data from the XML
  /** the type of measurement, see MeasurementType enum (in models.ts) for description of numbers. */
  type_index: number;
  /**  the value for the measurement, can mean different things dependent on type of measurement */
  value: number;
  /** the distance from the beginning of the survey */
  distance_survey: number;
  /** the date in format: year/month/day hour:minute:second.millisecond. */
  timestamp: string;
  // data from Valhalla
  /** the automatically generated uuid from the database for the corresponding way entry in the way table. */
  fk_way_id?: string;
  /** the distance from the beginning of the way */
  distance_way?: number;
  /** GPS point */
  position?: LatLng;
}

export interface SurveyImage {
  // data from the XML
  /** The type of image, for example, 'DashCamera'. */
  type: string;
  /** The file path where the image is stored. */
  image_path: string;
  /** The distance from the beginning of the survey at which the image was captured. */
  distance_survey: number;
  /** The timestamp of the image capture in the format: year/month/day hour:minute:second.millisecond */
  timestamp: string;
  // data from Valhalla
  /** the automatically generated uuid from the database for the corresponding way entry in the way table. */
  fk_way_id?: string;
  /** the distance from the beginning of the way */
  distance_way?: number;
}

export interface XML {
  /** Path to xml */
  path: string;
  /** Date of the survey */
  date: string;
  /** The distance from the beginning */
  distance: number;
}

export interface SurveyStructure {
  /** our own survey id */
  fk_survey_id?: string;
  /** the path to the directory */
  directory: string;
  /** the path to the RSP file */
  RSP: string;
  /** the geometry of the section */
  geometry?: LatLng[];
  /** the path to the HDC folder */
  HDC: string;
  /** The xmls */
  XMLs: XML[];
  /** the camera directories */
  Cams: string[];
  /** the survey id of the dynatest */
  dynatestId: number;
}

const IMPLEMENTED_MODULES = [
  { idx: 0, function: count_cracks },
  { idx: 5, function: count_potholes },
  { idx: 9, function: get_roughness },
  { idx: 15, function: count_sealed_cracks },
  { idx: 16, function: count_mmo },
];

/**
 * Scans a given directory and creates an array containing the paths of all XML files found within that directory.
 * @param {string} HDC_directory - The path to the directory to be scanned for XML files.
 * @returns {string[]} - An array of strings, each representing the path to an XML file found in the specified directory.
 * @author Vejlgaard
 */
export function index_xml_files_in_HDC_directory(
  HDC_directory: string,
): string[] {
  let XMLs: string[] = [];
  readdirSync(HDC_directory).forEach((file) => {
    // we check if it's a xml file
    if (file.endsWith('.xml')) {
      XMLs.push(HDC_directory + '/' + file);
    }
  });
  return XMLs;
}

/**
 * Checks if there is at least an RSP file and HDC folder in directory.
 * @param {string} directory path to a directory.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @returns boolean when valid data or null if there is no valid data
 * @author Vejlgaard, Liu
 */
export function find_surveys(
  directory: string,
  debug: boolean,
): SurveyStructure[] {
  // the directories in the given directory
  let directories: string[] = readdirSync(directory).filter((name: string) =>
    lstatSync(directory + '/' + name).isDirectory(),
  );

  // find surveys in the directory
  let surveys: SurveyStructure[] = [];
  directories.forEach((surveyDirectoryName: string) => {
    let surveyDirectory = `${directory}/${surveyDirectoryName}`;
    if (debug) console.debug(`Checking directory: ${surveyDirectory}`);

    // check for an RSP file
    if (!existsSync(surveyDirectory + '.RSP')) {
      if (debug) {
        console.debug('There is no RSP file in the directory');
        console.debug('-----------------------------------');
      }
      return;
    }

    // check for an HDC folder
    if (!existsSync(surveyDirectory + '/HDC')) {
      if (debug) {
        console.debug('There is no HDC folder in the directory');
        console.debug('-----------------------------------');
      }
      return;
    }

    let cams: string[] = [];
    readdirSync(surveyDirectory).forEach((subdir) => {
      let fullPath = join(surveyDirectory, subdir);
      if (lstatSync(fullPath).isDirectory() && subdir.startsWith('Cam')) {
        cams.push(fullPath);
        if (debug) {
          console.log('Found Cam folder: ' + fullPath);
        }
      }
    });

    const xmls = index_xml_files_in_HDC_directory(surveyDirectory + '/HDC');
    const dynatestId = get_surveyID(xmls[0], debug);

    surveys.push({
      directory: surveyDirectory,
      RSP: surveyDirectory + '.RSP',
      HDC: surveyDirectory + '/HDC',
      XMLs: xmls.map((path) => {
        let content = readFileSync(path).toString();
        const date = get_date(content, debug);
        const distance = get_start(content, debug);
        content = null; // DON'T REMOVE (make sure the gc knows that this needs to be freed)

        return {
          path: path,
          date: date,
          distance: distance,
        };
      }),
      Cams: cams,
      dynatestId: dynatestId,
    });
  });

  return surveys;
}

/**
 * Parses a given .rsp file to extract and format geographic coordinates.
 * @param {string} rspFilePath - The path to the .rsp file to be parsed.
 * @returns {LatLng[]} - Array of coordinates (latitude and longitude).
 * @author Liu
 */
export function extractCoordinatesFromRSP(rspFilePath: string): LatLng[] {
  const fileContents = readFileSync(rspFilePath, 'utf-8');
  const parsedData = parse(fileContents, {
    header: false,
    skipEmptyLines: true,
  });
  let coordinates: LatLng[] = [];
  const datas = parsedData.data.filter(
    (row) => row[0] === '5280' && row[3] === '0',
  );

  for (let i = 0; i < datas.length; i++) {
    const row = datas[i];
    coordinates.push({
      lng: Number(`${parseFloat(row[6])}`),
      lat: Number(`${parseFloat(row[5])}`),
    });
  }

  return coordinates;
}

/**
 * Uses the XML files to extract the measurement data.
 * @param {SurveyStructure} survey the survey structure for the dataset.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @returns {SurveyData[]} The data extracted from the XML files.
 * @author Vejlgaard
 */
export function extract_measurements_data(
  survey: SurveyStructure,
  debug: boolean,
): SurveyData[] {
  try {
    if (debug) {
      console.log('Local variable for dataset: ' + survey.directory);
      console.log('SurveyID for dataset: ' + survey.dynatestId);
      console.log(
        'ID for the corresponding entry into survey table, for dataset: ' +
          survey.fk_survey_id,
      );
      console.log('date for dataset: ' + survey.XMLs[0].date);
      console.log('-----------------------------------');
    }
    let data: SurveyData[] = [];

    // for each xml file
    survey.XMLs.forEach((xml) => {
      // get the distance from the start of the survey
      const available_modules = whats_available(xml.path, debug);

      // for each implemented module
      IMPLEMENTED_MODULES.forEach((module) => {
        if (available_modules[module.idx]) {
          const value = module.function(xml.path, debug);
          // Allow the inclusion of valid '0' values, while excluding null or undefined values.
          if (value != null) {
            data.push({
              type_index: module.idx,
              value: value,
              distance_survey: xml.distance,
              timestamp: xml.date,
            });
          }
        }
      });
    });

    return data;
  } catch (error) {
    console.error('Error uploading measurement data:', error);
    return null;
  }
}
