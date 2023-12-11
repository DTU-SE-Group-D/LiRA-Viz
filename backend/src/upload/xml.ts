import { print_whats_available } from './utils';
import { readFileSync } from 'fs';

/**
 * Counts cracks in one xml file.
 * @param {string} file path to a xml file
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @returns the total count of cracks in the file as a number.
 * @author Vejlgaard
 */
export function count_cracks(file: string, debug: boolean): number {
  let words = readFileSync(file).toString();
  const count = (words.match(/CrackID/g) || []).length / 2;
  words = null; // DON'T REMOVE (make sure the gc knows that this needs to be freed)

  if (debug) {
    console.log('The total amount of cracks file: ' + file + 'is: ' + count);
    console.log('-----------------------------------');
  }

  return count;
}

/**
 * Counts potholes in one xml file. Needs the full path to the xml file as input.
 * @param {string} file path to a xml file
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @returns the total count of potholes in the file as a number.
 * @author Vejlgaard
 */
export function count_potholes(file: string, debug: boolean): number {
  let words = readFileSync(file).toString();
  const count = (words.match(/PotholeID/g) || []).length / 2;

  if (debug) {
    console.log(
      'The total amount of potholes in file: ' + file + 'is: ' + count,
    );
    console.log('-----------------------------------');
  }

  return count;
}

/**
 * Counts sealed crack's in one xml file. Needs the full path to the xml file as input.
 * @param {string} file path to a xml file
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @returns the total count of sealed crack's in the file as a number.
 * @author Vejlgaard
 */
export function count_sealed_cracks(file: string, debug: boolean): number {
  let words = readFileSync(file).toString();
  const count = (words.match(/SealedCrackID/g) || []).length / 2;

  if (debug) {
    console.log(
      "The total amount of sealed crack's in file: " + file + 'is: ' + count,
    );
    console.log('-----------------------------------');
  }

  return count;
}

/**
 * Counts MMO's in one xml file. Needs the full path to the xml file as input.
 * @param {string} file path to a xml file
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @returns the total count of MMO's in the file as a number.
 * @author Vejlgaard
 */
export function count_mmo(file: string, debug: boolean): number {
  let words = readFileSync(file).toString();
  const count1 = (words.match(/ManHoleID/g) || []).length / 2;
  const count2 = (words.match(/StormDrainID/g) || []).length / 2;
  const count = count1 + count2;

  if (debug) {
    console.log("The total amount of MMO's in file: " + file + 'is: ' + count);
    console.log('-----------------------------------');
  }

  return count;
}

/**
 * Get the average IRI value from one xml file. The average is calculated as the sum of all IRI values divided by the number of IRI values.
 * @param {string} file path to a xml file
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @returns the average of the IRI for the file as a number.
 * @author Vejlgaard
 */
export function get_roughness(file: string, debug: boolean): number {
  const allFileContents = readFileSync(file, 'utf-8');
  let AOIRI = 0;
  let Abuff = 0;

  allFileContents.split(/\r?\n/).every((line) => {
    if (line.includes('NbrValues')) {
      AOIRI = Number(line.split('<NbrValues>')[1].split('</NbrValues>')[0]);
    }
    if (line.includes('IRI') && !line.includes('m/km')) {
      let IRIbuff = line.split('<IRI>')[1].split('</IRI>')[0].split(' ');
      for (let i = 0; i < AOIRI; i++) {
        Abuff += Number(IRIbuff[i]);
      }
    }
    return !line.includes('</RoughnessMeasurements>');
  });

  Abuff = Math.round((Abuff / 4) * 100) / 100;

  if (debug) {
    console.log(
      'The average IRI value for the xml file is: ' + Abuff + ' from: ' + file,
    );
    console.log('-----------------------------------');
  }

  return Abuff;
}

const MODULES_NAME = [
  { idx: 0, name: 'CrackingModule_Parameters' },
  { idx: 1, name: 'RuttingModule_Parameters' },
  { idx: 2, name: 'MacroTextureModule_Parameters' },
  { idx: 3, name: 'LaneMarkingModule_Parameters' },
  { idx: 5, name: 'PotholeModule_Parameters' },
  { idx: 6, name: 'DropoffModule_Parameters' },
  { idx: 7, name: 'JointModule_Parameters' },
  { idx: 8, name: 'RavelingModule_Parameters' },
  { idx: 9, name: 'RoughnessModule_Parameters' },
  { idx: 10, name: 'SlopeAndCrossSlopeModule_Parameters' },
  { idx: 13, name: 'PickoutModule_Parameters' },
  { idx: 14, name: 'BleedingModule_Parameters' },
  { idx: 15, name: 'SealedCrackModule_Parameters' },
  { idx: 16, name: 'ManMadeObjectInformation' },
  //BIG NOTE: THIS FEATURE IS STILL UNDER DEVELOPMENT BY DYNATEST, I.E IT'S NEVER AVALIABLE
  { idx: 17, name: 'PatchModule_Parameters' },
  //BIG NOTE: THIS FEATURE IS STILL UNDER DEVELOPMENT BY DYNATEST, I.E IT'S NEVER AVALIABLE
  { idx: 18, name: 'PumpingModule_Parameters' },
];

const DYNATEST_MODULE_NUMBER = 19;

/**
 * Get the available modules of the xml file and store it in the AvialArr array as boolean values. Uses the function print_whats_available for the debug feature.
 * @param {string} file path to xml file.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @author Vejlgaard
 */
export function whats_available(file: string, debug: boolean): boolean[] {
  let available: boolean[] = new Array(DYNATEST_MODULE_NUMBER).fill(false);

  const allFileContents = readFileSync(file).toString();
  allFileContents.split(/\r?\n/).forEach((line) => {
    for (let i = 0; i < MODULES_NAME.length; i++) {
      if (line.includes(MODULES_NAME[i].name))
        available[MODULES_NAME[i].idx] = true;
    }

    //Check for rumble strip module
    if (line.includes('RumbleModule_RumbleStripEnable')) {
      //If there is a rumble module, it checks that it is enabled, (normally if it's there its enabled, but we have to be sure)
      if (
        line
          .split('<RumbleModule_RumbleStripEnable>')[1]
          .split('</RumbleModule_RumbleStripEnable>')[0] == String(1) // TODO: not sure about this condition
      ) {
        available[4] = true;
      }
    }
    //Check for Water entrapment calculation
    if (line.includes('RuttingModule_Method')) {
      //If there is a rutting module, it checks the RuttingModule_Method is enabled. If its zero it means that there is no water entrapment calculation
      if (
        line
          .split('<RuttingModule_Method>')[1]
          .split('</RuttingModule_Method>')[0] == String(1) // TODO: not sure about this condition
      ) {
        available[11] = true;
      }
    }
    //Check for shoving calculation
    if (line.includes('ShovingModule_EnableShovingDetection')) {
      //If there is a rutting module, it checks the shoving is enabled. If its zero it means that there is no water entrapment calculation
      if (
        line
          .split('<ShovingModule_EnableShovingDetection>')[1]
          .split('</ShovingModule_EnableShovingDetection>')[0] == String(1) // TODO: not sure about this condition
      ) {
        available[12] = true;
      }
    }
  });

  if (debug) {
    print_whats_available(file, available);
  }

  return available;
}

/**
 * Get the surveyID of the xml file and returns the survey id.
 * @param {string} file path to a xml file.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @returns the survey id from xml file as a number.
 * @author Vejlgaard
 */
export function get_surveyID(file: string, debug: boolean): number {
  const allFileContents = readFileSync(file, 'utf-8');
  let id = 0;
  allFileContents.split(/\r?\n/).every((line) => {
    if (line.includes('SurveyID')) {
      id = Number(line.split('<SurveyID>')[1].split('</SurveyID>')[0]);
      return false;
    }
    return true;
  });

  if (debug) {
    console.log('The survey id from the xml file is: ' + id + ' from: ' + file);
    console.log('-----------------------------------');
  }

  return id;
}

/**
 * Get the date of the survey in the xml file and returns it.
 * @param {string} allFileContents content of the xml file
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @returns the date as a number in format: year/month/day hour:minute:second.millisecond.
 * @author Vejlgaard
 */
export function get_date(allFileContents: string, debug: boolean): string {
  let date: string = '';
  allFileContents.split(/\r?\n/).every((line) => {
    if (line.includes('DateAndTime')) {
      date = line.split('<DateAndTime>')[1].split('</DateAndTime>')[0];
      return false;
    }
    return true;
  });

  if (debug) {
    console.log('The date of the survey from the xml file is: ' + date);
    console.log('-----------------------------------');
  }

  return date;
}

/**
 * Get the start point of the xml file and returns the number
 * @param {string} allFileContents content of the xml file
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @returns the start value for the xml file relative to its survey as a number.
 * @author Vejlgaard
 */
export function get_start(allFileContents: string, debug: boolean) {
  let start = 0;
  allFileContents.split(/\r?\n/).every((line) => {
    if (line.includes('DistanceBegin_m')) {
      start = Number(
        line.split('<DistanceBegin_m>')[1].split('</DistanceBegin_m>')[0],
      );
      return false;
    }
    return true;
  });

  if (debug) {
    console.log('The start value for the survey is: ' + start);
    console.log('-----------------------------------');
  }

  return start;
}
