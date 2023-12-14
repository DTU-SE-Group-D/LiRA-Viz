const { Console, debug } = require('console');
const fs = require('fs');
const readline = require('readline');
const { pool } = require('./db.js');
const Papa = require('papaparse');

const {
  db_insert_survey_data,
  liradb_get_all_trips,
  liradb_get_all_coverage_by_fk_trip_id,
  liradb_get_multilinestring_from_coverage_by_uuid,
  liradb_get_timestamp,
  db_check_if_surveyID_exists,
  liradb_get_rowCount_and_all_uuids_for_coverage,
  liradb_get_corverage_entry_by_uuid,
  liradb_get_way_entry_by_uuid,
  db_check_osm_id_and_get_uuid_in_way_tabel,
  liradb_get_end_time_by_fk_trip_id,
  liradb_get_coverage_values_by_fk_coverage_id,
  liradb_get_type_and_value_for_coverage_values_entry_by_uuid,
  db_insert_lira_data_in_measurement_table,
} = require('./lira_query_functions.js');

const { exit } = require('process');
const internal = require('stream');
const path = require('path');

const testFolder1 = './MFV Motorvej O4 2022';
const testFolder2 = './MFV Ballerup 2023';
const testFolder3 = './MFV Saudi Arabia 5051-299';
const testFolder4 = './the_big_null_folder';

const HDCtestFolder = './MFV Ballerup 2023/Test2/HDC';
const xmlTestFile =
  './MFV Ballerup 2023/Test2/HDC/LcmsSurvey_3050354664_000089.xml';

/* These arrays and varibel are only used for the trips functions  */
let tripArr = [];
let trip_timestampArr = [];
let conv_fk_tripArr = [];
let trips_section_geomArr = [];
const lira_start_value = 1404000000;
let created_survey_idArr = [];
let fk_survey_idArr = [];

/* These global arrays and varibels are used for the_new_controle_function*/
let rowCount = -1;
let all_coverage_uuidArr = [];
let buff_distance01 = -1;
let buff_distance02 = -1;
let buff_fk_trip_id = -1;
let buff_fk_way_id = -1;
let buff_osm_id = -1;
let buff_length = -1;
let buff_osm_id_uuid = -1;
let buff_distance_way = -1;
let buff_lat_mapped = -1;
let buff_lon_mapped = -1;
let buff_timestamp = -1;
let buff_coverage_values_uuidArr = [];
let buff_rowCount = -1;
let buff_type = [];
let buff_value = [];

the_new_controle_function(true);

/* Function under here */

/**
 * This function uses the liradb_get_all_trips function to get all entries uuid from the lira database, and put in into the global tripArr.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @author Vejlgaard
 */
async function get_all_trips(debug) {
  const buff = liradb_get_all_trips(debug);
  tripArr = await buff;
}

/**
 * This function uses the liradb_get_all_coverage_by_fk_trip_id function to get all entires that has a specific fk_trip_id, and sort in into the global conv_fk_tripArr[*1][*2]. It's a recursive function that runs for the length of the global tripArr. *1 is the uuid for trip entires. *2 is the uuid foor the coverage entires with the fk_trip_id corresponding to trip uuid.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @author Vejlgaard
 */
async function get_all_trips_coverage(debug) {
  //We need var i, might look redudant but if its not there, the function won't be async and won't work.
  var i;
  for (i = 0; i < tripArr.length; i++) {
    const buff = await liradb_get_all_coverage_by_fk_trip_id(tripArr[i], debug);
    conv_fk_tripArr[i] = buff;
  }
}

/**
 * This function gets all section_geom for a trip and create one long section_geom/multilinestring. It puts the createt section_geom in the trips_section_geom array, at the index corrosponding to tripArr index.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @author Vejlgaard
 */
async function liradb_get_section_geom_from_coverage(debug) {
  var i;
  var j;
  var stringBuff;
  var stringBuffArr = [];
  for (i = 0; i < conv_fk_tripArr.length; i++) {
    stringBuff = [];
    stringBuffArr = [];
    for (j = 0; j < conv_fk_tripArr[i].length; j++) {
      const buff = await liradb_get_multilinestring_from_coverage_by_uuid(
        conv_fk_tripArr[i][j],
        false,
      );
      stringBuff = await buff.split(' ');
      stringBuffArr.push([
        Number(`${parseFloat(await stringBuff[0])}`),
        Number(`${parseFloat(await stringBuff[1])}`),
      ]);
    }
    trips_section_geomArr[i] = stringBuffArr;
    if (debug) {
      console.log('Data in the trips_section_geom at index ' + i + ': ');
      console.log(trips_section_geomArr[i]);
      console.log('-----------------------------------');
    }
  }
}

/**
 * This function uses the liradb_get_timestamp function to get the timestamp for all trips, and sort in into the global trip_timestampArr. It's a recursive functino that runs for the length of the global tripArr.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @author Vejlgaard
 */
async function get_all_timestamps(debug) {
  //We need var i, might look redudant but if its not there, the function won't be async and won't work.
  var i;
  for (i = 0; i < tripArr.length; i++) {
    const buff = await liradb_get_timestamp(tripArr[i], debug);
    trip_timestampArr[i] = buff;
  }
}

/**
 * This function creates random survey id's and puts it them in the created_survey_idArr array at the index corrosponding to the tripsArr array. This function uses the db_check_if_surveyID_exists to check if a random genareted survey_id allready exists in the survey table. It's a recursive functino that runs for the length of the global tripArr.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @author Vejlgaard
 */
async function create_and_check_survey_id(debug) {
  var i;
  for (i = 0; i < tripArr.length; i++) {
    kevin = true;
    while (kevin) {
      let buff = lira_start_value + Math.floor(Math.random() * 1000000);
      if (!(await db_check_if_surveyID_exists(buff, debug))) {
        created_survey_idArr[i] = buff;
        kevin = false;
        if (debug) {
          console.log(
            'Value in created_survey_idArr index ' +
              i +
              ': ' +
              created_survey_idArr[0],
          );
          console.log('-----------------------------------');
        }
      }
    }
  }
}

/**
 * This function uses the formatet trip data from the lira database, and uploads it all to the survey tabel in our database.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @author Vejlgaard
 */
async function upload_lira_data_to_survey_table(debug) {
  //We need var i, might look redudant but if its not there, the function won't be async and won't work.
  var i;
  for (i = 0; i < tripArr.length; i++) {
    const buff = db_insert_survey_data(
      JSON.stringify({
        type: 'MultiLineString',
        coordinates: [trips_section_geomArr[i]],
      }),
      trip_timestampArr[i],
      created_survey_idArr[i],
      'Lira',
      false,
    );

    fk_survey_idArr[i] = await buff;

    if (debug) {
      console.log('ID from the database: ' + fk_survey_idArr[i]);
      console.log('Local variables for dataset: ' + DirArr[i]);
      console.log('SurveyID for dataset: ' + local_surveyID);
      console.log('date for dataset: ' + local_date);
      console.log('section_geom: ' + section_geom);
      console.log('-----------------------------------');
    }
  }
}

/**
 * This function uses query function liradb_get_rowCount_and_uuids_for_coverage to get the data and then sort it. It modifies the global number rowCount and array all_coverage_uuidArr.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @author Vejlgaard
 */
async function get_and_sort_lira_rowCount_and_all_uuids_for_coverage(debug) {
  //Query function that returns the result of the query
  const res_buff = await liradb_get_rowCount_and_all_uuids_for_coverage(debug);

  rowCount = res_buff.rowCount;

  for (i = 0; i < rowCount; i++) {
    all_coverage_uuidArr[i] = res_buff.rows[i].id;
  }

  if (debug) {
    console.log('The rowCount is: ' + rowCount);
    console.log('uuid in all_coverage_uuidArr[0]: ' + all_coverage_uuidArr[0]);
    console.log(
      'uuid in all_coverage_uuidArr[rowCount - 1]: ' +
        all_coverage_uuidArr[rowCount - 1],
    );
    console.log('-----------------------------------');
  }
}

/**
 * This function uses query function liradb_get_one_corverage_entry_by_uuid to get the data then sort it. It modifies the global numbers buff_distance01, buff_distance02, buff_fk_trip_id and buff_fk_way_id.
 * @param {number} uuid is the uuid we want the query function to get.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @author Vejlgaard
 */
async function get_and_sort_lira_corverage_entry(uuid, debug) {
  const res_buff = await liradb_get_corverage_entry_by_uuid(uuid, debug);

  buff_distance01 = res_buff.rows[0].distance01;
  buff_distance02 = res_buff.rows[0].distance02;
  buff_fk_trip_id = res_buff.rows[0].fk_trip_id;
  buff_fk_way_id = res_buff.rows[0].fk_way_id;
  buff_lat_mapped = res_buff.rows[0].lat_mapped;
  buff_lon_mapped = res_buff.rows[0].lon_mapped;

  if (debug) {
    console.log('Data after sort for coverage entry uuid: ' + uuid);
    console.log('distance01: ' + buff_distance01);
    console.log('distance02: ' + buff_distance02);
    console.log('fk_trip_id: ' + buff_fk_trip_id);
    console.log('fk_way_id: ' + buff_fk_way_id);
    console.log('-----------------------------------');
  }
}

/**
 * This function uses query function liradb_get_one_way_entry_by_uuid to get the data then sort it. It modifies the global numbers buff_osm_id and buff_lenght.
 * @param {number} uuid is the uuid we want the query function to get.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @author Vejlgaard
 */
async function get_and_sort_lira_way_entry(uuid, debug) {
  const res_buff = await liradb_get_way_entry_by_uuid(uuid, debug);
  buff_osm_id = res_buff.rows[0].OSM_Id;
  buff_length = res_buff.rows[0].lenght;

  if (debug) {
    console.log('Data after sort for way entry uuid: ' + uuid);
    console.log('buff_osm_id: ' + buff_osm_id);
    console.log('buff_lenght: ' + buff_length);
    console.log('-----------------------------------');
  }
}

/**
 * This function uses query function db_check_osm_id_and_get_uuid_in_way_tabel to search and get data from our database. It then sorts the data and return false if the data is valid. This function is meant to be used as the skip if we don't have the osm_id in our database. So true, we skip this coverage entry and false we use this coverage entry.
 * @param {number} osm_id is the osm_id we want the query function to seach for.
 * @param {number} length is the length for the osm_id we got from the liradatabase. This is used for an extra check that our osm data is equal'ish to the lira osm data.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @returns a boolean thats false if the osm_id exists in our database, else true.
 * @author Vejlgaard
 */
async function get_check_and_sort_db_way_entry(osm_id, length, debug) {
  buff_osm_id_uuid = await db_check_osm_id_and_get_uuid_in_way_tabel(
    osm_id,
    length,
    debug,
  );

  if (buff_osm_id_uuid != -1) {
    return false;
  } else {
    return true;
  }
}

/**
 * This is a very simpel function where the simpel calulations for distance_way is done. Uses the formula: ((distance01 + distance02) / 2) * buff_length;
 * @param {number} distance01 is distance 1 from the coverage entry.
 * @param {number} distance02 is distance 2 from the coverage entry.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @returns the result of the calculation as a number.
 * @author Vejlgaard
 */
function simpel_distance_way(distance01, distance02, debug) {
  buff = ((distance01 + distance02) / 2) * buff_length;
  if (debug) {
    console.log('Simpel distance_way: ' + buff);
    console.log('-----------------------------------');
  }
  return buff;
}

/**
 * This function uses the query function liradb_get_coverage_values_by_fk_coverage_id to get all coverage_valures with the fk_coverage_key equal to the given uuid, from the lira database. It then sorts the data into the global number buff_rowCount and global array buff_coverage_values_uuidArr.
 * @param {number} uuid is the uuid we want the query function to get.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @author Vejlgaard
 */
async function get_and_sort_lira_coverage_values_by_fk_coverage_id(
  uuid,
  debug,
) {
  //Query function that returns the result of the query
  const res_buff = await liradb_get_coverage_values_by_fk_coverage_id(
    uuid,
    debug,
  );

  buff_rowCount = res_buff.rowCount;

  for (i = 0; i < buff_rowCount; i++) {
    buff_coverage_values_uuidArr[i] = res_buff.rows[i].id;
  }

  if (debug) {
    console.log('The rowCount is: ' + buff_rowCount);
    console.log(
      'uuid in buff_coverage_values_uuidArr[0]: ' +
        buff_coverage_values_uuidArr[0],
    );
    console.log(
      'uuid in buff_coverage_values_uuidArr[rowCount - 1]: ' +
        buff_coverage_values_uuidArr[buff_rowCount - 1],
    );
    console.log('-----------------------------------');
  }
}

/**
 * This function uses the query function liradb_get_type_and_value_for_coverage_values_entry_by_uuid to get type and value for all the entries in buff_coverage_values_uuidArr. It then sorts the data into global array buff_type and buff_value.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @author Vejlgaard
 */
async function get_and_sort_lira_corverage_value_type_and_value(debug) {
  var j;
  for (j = 0; j < buff_rowCount; j++) {
    const res_buff =
      await liradb_get_type_and_value_for_coverage_values_entry_by_uuid(
        buff_coverage_values_uuidArr[j],
        debug,
      );
    buff_type[j] = res_buff.rows[0].type;
    //We have to round to only 15 decimals, our database can max have 15 decimals. We might loss 2 or 3 decimals at the end.
    buff_value[j] = res_buff.rows[0].value.toFixed(15);
    if (debug) {
      console.log('The buff_type is: ' + buff_type[j] + ' for index: ' + i);
      console.log('The buff_value is: ' + buff_value[j] + ' for index: ' + i);
      console.log('-----------------------------------');
    }
  }
}

/**
 * This function takes a string and returns the type as number. This function is a big switch statment, basicly a lookup tabel for the content of AvailArr. Only implementet strings for liravis type data.
 * @param {string} type the type as a string from the liravis database.
 * @returns the type index as a number.
 * @author Vejlgaard
 */
function give_index_number_for_lira_coverage_value(type) {
  switch (type) {
    case 'E_norm':
      return 19;
    case 'KPI':
      return 20;
    case 'Mu':
      return 21;
    case 'DI':
      return 22;
    case 'E_whl':
      return 23;
    case 'E_areo':
      return 24;
    case 'E_whl_std':
      return 25;
    case 'E_tire_std':
      return 26;
    case 'E_tire':
      return 27;
    case 'E_ineratia_slope':
      return 28;
    case 'E_inertia_slope_std':
      return 29;
    case 'E_areo_std':
      return 30;
    case 'E_norm_std':
      return 31;
    case 'mu_std':
      return 32;
    case 'IRI':
      return 33;
    case 'IRI_new':
      return 34;
    case 'E_brk':
      return 35;
    case 'E_brk_std':
      return 36;
    case 'E_inertia_slope_std':
      return 37;
    default:
      return 38;
  }
}

/**
 * This function uses the query function db_insert_lira_data_in_measurement_table to upload entries to the measument tabel in our database.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @author Vejlgaard
 */
async function upload_all_coverage_values_for_coverage_to_db(debug) {
  var j = 0;

  for (j; j < buff_rowCount; j++) {
    await db_insert_lira_data_in_measurement_table(
      give_index_number_for_lira_coverage_value(buff_type[j]),
      buff_value[j],
      buff_timestamp,
      buff_distance_way,
      buff_osm_id_uuid,
      buff_lat_mapped,
      buff_lon_mapped,
      debug,
    );
    if (debug) {
      console.log(
        'Uploaded coverage_value: ' + j + ' to the measurment table in db',
      );
    }
  }
}

/**
 * This is the controle function for the whole process of importing, reformatning and uploading the lira data to our database.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @author Vejlgaard
 */
async function the_new_controle_function(debug) {
  //STEP 1
  await get_and_sort_lira_rowCount_and_all_uuids_for_coverage(debug);

  var i = 0;

  for (i; i < rowCount; i++) {
    buff_distance01 = -1;
    buff_distance02 = -1;
    buff_fk_trip_id = -1;
    buff_fk_way_id = -1;
    buff_osm_id = -1;
    buff_length = -1;
    buff_osm_id_uuid = -1;
    buff_distance_way = -1;
    buff_lat_mapped = -1;
    buff_lon_mapped = -1;
    buff_timestamp = -1;
    buff_coverage_values_uuidArr = [];
    buff_rowCount = -1;
    buff_type = [];
    buff_value = [];

    //STEP 2
    await get_and_sort_lira_corverage_entry(all_coverage_uuidArr[i], debug);
    //STEP 3
    await get_and_sort_lira_way_entry(buff_fk_way_id, debug);
    //STEP 4
    if (
      await get_check_and_sort_db_way_entry(buff_osm_id, buff_length, debug)
    ) {
      continue;
    }
    //STEP 5
    buff_distance_way = simpel_distance_way(
      buff_distance01,
      buff_distance02,
      debug,
    );
    //STEP 6
    buff_timestamp = await liradb_get_end_time_by_fk_trip_id(
      buff_fk_trip_id,
      debug,
    );

    //STEP 7
    await get_and_sort_lira_coverage_values_by_fk_coverage_id(
      all_coverage_uuidArr[i],
      debug,
    );
    //STEP 8
    await get_and_sort_lira_corverage_value_type_and_value(debug);
    //STEP 9
    await upload_all_coverage_values_for_coverage_to_db(debug);
  }
}

/*
Content of AvailArr 
0. Crack detection module
1. Rutting module
2. Macro-texture module
3. Lane marking module
4. Rumble strip detection module
5. Potholes module
6. Drop-off and curb module
7. Joint module for concrete pavement
8. Raveling module
9. Roughness module
10. Road geometry (slope and cross-slope) module
11. Water entrapment calculation
12. Shoving calculation
13. Pick-out detection module
14. Bleeding module
15. Sealed crack module
16. Manholes(man-made object-mmo) module
17. Patch detection module
18. Pumping detection module
19. E_norm
20. KPI
21. Mu
22. DI
23. E_whl
24. E_areo
25. E_whl_std
26. E_tire_std
27. E_tire
28. E_ineratia_slope
29. E_inertia_slope_std
30. E_areo_std
31. E_norm_std
32. mu_std
33. IRI
34. IRI_new
35. E_brk
36. E_brk_std
37. E_inertia_slope_std
*/

/*
The index of importent types:
0. Crack detection module
5. Potholes module
9. Roughness module
15. Sealed crack module
16. Manholes(man-made object-mmo) module
19. E_norm
20. KPI
21. Mu
22. DI
32. mu_std
33. IRI
*/
