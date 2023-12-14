const { Console } = require('console');
const { pool } = require('./db');
const { lirapool } = require('./liradb');

/**
 * Gets all uuid from all entries in the tabel trips in the lira database through a query.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
 * @returns an array with all the entries uuid as strings, from the lira database table called "trips".
 * @author Vejlgaard
 */
async function liradb_get_all_trips(debug) {
  var buff = [];
  try {
    const res = await lirapool.query('SELECT * FROM trips');
    if (debug) {
      console.log('There are: ' + res.rowCount + ' entries in the trips tabel');
      console.log('-----------------------------------');
    }
    for (i = 0; i < res.rowCount; i++) {
      buff[i] = res.rows[i].id;
    }
  } catch (error) {
    console.error(error);
  }
  return buff;
}

/**
 * Gets all entries in the coverage table, in the lira database, that has the fk_trip_id given to the function.
 * @param {number} fk_trip_id is the uuid of an entry in the trip tabel in the lira database.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default. It is highly recommended to set the debug boolean to false.
 * @returns an array with all the uuid as strings, of the entries that has the fk_trip_id.
 * @author Vejlgaard
 */
async function liradb_get_all_coverage_by_fk_trip_id(fk_trip_id, debug) {
  var buff = [];
  try {
    const res = await lirapool.query(
      "SELECT * FROM coverage WHERE fk_trip_id='" +
        fk_trip_id +
        "' ORDER BY compute_time;",
    );
    if (debug) {
      console.log(
        'There are: ' +
          res.rowCount +
          ' entries in the condition_coverage tabel',
      );
      console.log('-----------------------------------');
    }
    for (i = 0; i < res.rowCount; i++) {
      buff[i] = res.rows[i].id;
    }
  } catch (error) {
    console.error(error);
  }
  return buff;
}

/**
 * Gets the section geometry as a string for a entry with the uuid, reformats it and returns it.
 * @param {number} uuid is the uuid of the entry we want the section_geom from.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default. It is highly recommended to set the debug boolean to false.
 * @returns a string of the section_geom in format: 12.559807556085179 55.71318741557432, 12.559526276286647 55.71355835839164.
 * @author Vejlgaard
 */
async function liradb_get_multilinestring_from_coverage_by_uuid(uuid, debug) {
  var buff;
  try {
    const res = await lirapool.query(
      "SELECT ST_AsText(section_geom) FROM coverage WHERE id='" + uuid + "'",
    );
    buff = res.rows[0].st_astext.split('(').pop().split(')')[0];
  } catch (error) {
    console.error(error);
  }

  if (debug) {
    console.log('uuid search for: ' + uuid);
    console.log('section_geom: ' + buff);
    console.log('-----------------------------------');
  }
  return buff;
}

/**
 * This function gets the timestamp as a string for a entry with the uuid, reformats it and returns it.
 * @param {number} uuid is the uuid of the entry we want the timestamp from.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default. It is highly recommended to set the debug boolean to false.
 * @returns a string of the timestamp in format: YYYY/MM/DD HH24:MM:SS.
 * @author Vejlgaard
 */
async function liradb_get_timestamp(uuid, debug) {
  var buff;
  try {
    const res = await lirapool.query(
      "SELECT TO_CHAR(end_time_utc, 'YYYY/MM/DD HH24:MM:SS') FROM trips WHERE id='" +
        uuid +
        "'",
    );
    buff = res.rows[0].to_char;
  } catch (error) {
    console.error(error);
  }

  if (debug) {
    console.log('uuid search for in trip tabel: ' + uuid);
    console.log('timestamp: ' + buff);
    console.log('-----------------------------------');
  }
  return buff;
}

/**
 * This function checks if the given survey_id exists in the survey table and returns the answere as a boolean.
 * @param {number} survey_id is the survey_id of the entry we want to check for.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default. It is highly recommended to set the debug boolean to false.
 * @returns a boolean that is true if the survey_id exists and false if it dosent exists.
 * @author Vejlgaard
 */
async function db_check_if_surveyID_exists(survey_id, debug) {
  var buff;
  try {
    const res = await pool.query(
      //"WHERE EXISTS (SELECT * FROM survey WHERE survey_id='" + survey_id + "');"
      "SELECT exists (SELECT 1 FROM survey WHERE survey_id = '" +
        survey_id +
        "' LIMIT 1);",
    );
    buff = res.rows[0].exists;
  } catch (error) {
    console.error(error);
  }

  if (debug) {
    console.log('survey_id search for: ' + survey_id);
    console.log('exists: ' + buff);
    console.log('-----------------------------------');
  }
  return buff;
}

/**
 * This function gets all entries where distance01 != 0 AND distance02 != 0 from the coverage tabel in lira database.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default. It is highly recommended to set the debug boolean to false.
 * @returns the resulting query for sorting.
 * @author Vejlgaard
 */
async function liradb_get_rowCount_and_all_uuids_for_coverage(debug) {
  var buff = 0;
  try {
    const res = await lirapool.query(
      'SELECT * FROM coverage WHERE distance01 != 0 AND distance02 != 0',
    );
    buff = res;
  } catch (error) {
    console.error(error);
  }

  if (debug) {
    console.log(
      'rowCount for all valid entries in the coverage tabel: ' + buff.rowCount,
    );
    console.log('-----------------------------------');
  }
  return buff;
}

/**
 * This function gets the entry, from the coverage table, with the uuid and returns the query.
 * @param {number} uuid is the uuid of the entry we want the data from.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default. It is highly recommended to set the debug boolean to false.
 * @returns the resulting query for sorting.
 * @author Vejlgaard
 */
async function liradb_get_corverage_entry_by_uuid(uuid, debug) {
  var buff = 0;
  try {
    const res = await lirapool.query(
      "SELECT * FROM coverage WHERE id='" + uuid + "'",
    );
    buff = res;
  } catch (error) {
    console.error(error);
  }

  if (debug) {
    console.log('Data from query for coverage entry uuid: ' + uuid);
    console.log('distance01: ' + buff.rows[0].distance01);
    console.log('distance02: ' + buff.rows[0].distance02);
    console.log('fk_trip_id: ' + buff.rows[0].fk_trip_id);
    console.log('fk_way_id: ' + buff.rows[0].fk_way_id);
    console.log('-----------------------------------');
  }
  return buff;
}

/**
 * This function gets the entry, from the ways table, with the uuid and returns the query.
 * @param {number} uuid is the uuid of the entry we want the data from.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default. It is highly recommended to set the debug boolean to false.
 * @returns the resulting query for sorting.
 * @author Vejlgaard
 */
async function liradb_get_way_entry_by_uuid(uuid, debug) {
  var buff = 0;
  try {
    const res = await lirapool.query(
      "SELECT * FROM ways WHERE id='" + uuid + "'",
    );
    buff = res;
  } catch (error) {
    console.error(error);
  }

  if (debug) {
    console.log('Data from query for way entry uuid: ' + uuid);
    console.log('osm_id: ' + buff.rows[0].OSM_Id);
    console.log('length: ' + buff.rows[0].lenght);
    console.log('-----------------------------------');
  }
  return buff;
}

/**
 * This function search for an entry with the given osm_id. Returns the uuid for the entry if found, else return -1.
 * @param {number} osm_id is the osm_id of the entry we are seaching for.
 * @param {number} buff_length is the length from the lira database. Is used to check that the length form lira database and our is the equal.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default. It is highly recommended to set the debug boolean to false.
 * @returns the uuid as a number if a entry is found with the osm_id, else return -1.
 * @author Vejlgaard
 */
async function db_check_osm_id_and_get_uuid_in_way_tabel(
  osm_id,
  buff_length,
  debug,
) {
  var buff = 0;
  try {
    const res = await pool.query(
      "SELECT * FROM way WHERE osm_id = '" + osm_id + "';",
    );
    buff = -1;
    if (res.rowCount != 0) {
      if (res.rows[0].length.toFixed(2) == buff_length.toFixed(2)) {
        buff = res.rows[0].id;
      }
    }
  } catch (error) {
    console.error(error);
  }

  if (debug) {
    console.log('osm_id seached for in way tabel: ' + osm_id);
    if (buff != -1) {
      console.log('uuid found for osm_id: ' + buff);
      console.log('-----------------------------------');
    } else {
      console.log('No valid data in our database for osm_id');
    }
  }
  return buff;
}

/**
 * This function uses the fk_trip_id to finde a timestamp for the coverage entry.
 * @param {number} fk_trip_id is the uuid for the trip we are seaching for.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default. It is highly recommended to set the debug boolean to false.
 * @returns the end_time for the trip that the coverage is from.
 * @author Vejlgaard
 */
async function liradb_get_end_time_by_fk_trip_id(fk_trip_id, debug) {
  var buff = 0;
  try {
    const res = await lirapool.query(
      "SELECT TO_CHAR(end_time_utc, 'YYYY/MM/DD HH24:MM:SS') FROM trips WHERE id='" +
        fk_trip_id +
        "'",
    );
    buff = res.rows[0].to_char;
  } catch (error) {
    console.error(error);
  }

  if (debug) {
    console.log('fk_trip_id seached for in trip tabel: ' + fk_trip_id);
    console.log('timestamp: ' + buff);
    console.log('-----------------------------------');
  }
  return buff;
}

/**
 * This function uses a uuid, from an coverage tabel entry, as fk_coverage_id to find all associated entries in the coverage_values tabel.
 * @param {number} uuid is the fk_coverage_id of the entry/entries we want to get:
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default. It is highly recommended to set the debug boolean to false.
 * @returns the resulting query for sorting.
 * @author Vejlgaard
 */
async function liradb_get_coverage_values_by_fk_coverage_id(uuid, debug) {
  var buff = 0;
  try {
    const res = await lirapool.query(
      "SELECT * FROM coverage_values WHERE fk_coverage_id = '" + uuid + "';",
    );
    buff = res;
  } catch (error) {
    console.error(error);
  }

  if (debug) {
    console.log('fk_coverage_id seached for in coverage_values tabel: ' + uuid);
    console.log(
      'rowCount for all valid entries in the coverage tabel: ' + buff.rowCount,
    );
    console.log('-----------------------------------');
  }
  return buff;
}

/**
 * This function uses a uuid to get the type and value from an entry in the coverage_values tabel.
 * @param {number} uuid is the uuid of the entry we want to get:
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default. It is highly recommended to set the debug boolean to false.
 * @returns the resulting query for sorting.
 * @author Vejlgaard
 */
async function liradb_get_type_and_value_for_coverage_values_entry_by_uuid(
  uuid,
  debug,
) {
  var buff = 0;
  try {
    const res = await lirapool.query(
      "SELECT * FROM coverage_values WHERE id = '" + uuid + "';",
    );
    buff = res;
  } catch (error) {
    console.error(error);
  }

  if (debug) {
    console.log('id seached for in coverage_values tabel: ' + uuid);
    console.log('-----------------------------------');
  }
  return buff;
}

/**
 * Uploads one entry to the measurment table with the given parameters as data. This function is just a variation of the query function db_insert_measurement_data, meant for the liravis importing proces.
 * @param {number} type_index the type of measurment, see readme or bottom of file for description of numbers. Can be null.
 * @param {number} value the value for the measurment, can mean different things dependant on type of measurment. Can be null.
 * @param {number} timestamp the date in format: year/month/day hour:minut:second.milisecond. Can be null.
 * @param {number} distance_way the distance from the begining of the way. Can be null.
 * @param {number} fk_way_id the automatically generated uuid from the database for the corresponding way entry in the survey table. Can't be null.
 * @param {number} latitude the latitude mapped from the coverage table in the lira database.
 * @param {number} longitude the longitude mapped from the coverage table in the lira database.
 * @param {boolean} debug debug boolean for printing relevant information, and is false by default. It is highly recommended to set the debug boolean to false.
 * @author Vejlgaard
 */
async function db_insert_lira_data_in_measurement_table(
  type_index,
  value,
  timestamp,
  distance_way,
  fk_way_id,
  latitude,
  longitude,
  debug,
) {
  try {
    const res = await pool.query(
      'INSERT INTO measurement (type_index, value, timestamp, distance_way, fk_way_id, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        type_index,
        value,
        timestamp,
        distance_way,
        fk_way_id,
        latitude,
        longitude,
      ],
    );
  } catch (error) {
    console.error(error);
  }
  if (debug) {
    console.log('Data uploaded to the database: ');
    console.log('type_index: ' + type_index);
    console.log('value: ' + value);
    console.log('timestamp: ' + timestamp);
    console.log('distance_way: ' + distance_way);
    console.log('fk_way_id: ' + fk_way_id);
    console.log('latitude: ' + latitude);
    console.log('longitude: ' + longitude);
    console.log('-----------------------------------');
  }
}

module.exports = {
  liradb_get_all_trips: liradb_get_all_trips,
  liradb_get_all_coverage_by_fk_trip_id: liradb_get_all_coverage_by_fk_trip_id,
  liradb_get_multilinestring_from_coverage_by_uuid:
    liradb_get_multilinestring_from_coverage_by_uuid,
  liradb_get_timestamp: liradb_get_timestamp,
  db_check_if_surveyID_exists: db_check_if_surveyID_exists,
  liradb_get_rowCount_and_all_uuids_for_coverage:
    liradb_get_rowCount_and_all_uuids_for_coverage,
  liradb_get_corverage_entry_by_uuid: liradb_get_corverage_entry_by_uuid,
  liradb_get_way_entry_by_uuid: liradb_get_way_entry_by_uuid,
  db_check_osm_id_and_get_uuid_in_way_tabel:
    db_check_osm_id_and_get_uuid_in_way_tabel,
  liradb_get_end_time_by_fk_trip_id: liradb_get_end_time_by_fk_trip_id,
  liradb_get_coverage_values_by_fk_coverage_id:
    liradb_get_coverage_values_by_fk_coverage_id,
  liradb_get_type_and_value_for_coverage_values_entry_by_uuid:
    liradb_get_type_and_value_for_coverage_values_entry_by_uuid,
  db_insert_lira_data_in_measurement_table:
    db_insert_lira_data_in_measurement_table,
};

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
