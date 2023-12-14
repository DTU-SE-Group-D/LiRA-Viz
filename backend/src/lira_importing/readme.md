# readme

**These functions are only meant to be used ones to import the lira database, reformat it and uploaded to our own database. For these scripts to work you need a copy off the db.js and liradb.js for the scripts to work. These files will not be uploaded to github.**

## A list over function in lira_database_import_functions.js

**This counts for all functions with debug boolean. The debug boolean is by default false, and the function can be called without a debug argument given.**

- async function get_all_trips(debug)
- async function get_all_trips_coverage(debug)
- async function liradb_get_section_geom_from_coverage(debug)
- async function get_all_timestamps(debug)
- async function create_and_check_survey_id(debug)
- async function upload_lira_data_to_survey_table(debug)
- async function the_old_controle_function(debug)
- async function get_and_sort_lira_rowCount_and_all_uuids_for_coverage(debug)
- async function get_and_sort_lira_corverage_entry(uuid, debug)
- async function get_and_sort_lira_way_entry(uuid, debug)
- async function get_check_and_sort_db_way_entry(osm_id, length, debug)
- function simpel_distance_way(distance01, distance02, debug)
- async function get_and_sort_lira_coverage_values_by_fk_coverage_id(uuid, debug)
- async function get_and_sort_lira_corverage_value_type_and_value(debug)
- function give_index_number_for_lira_coverage_value(type)
- async function upload_all_coverage_values_for_coverage_to_db(debug)
- async function the_new_controle_function(debug)

## A list over function in lira_query_functions.js

- async function liradb_get_all_trips(debug)
- async function liradb_get_all_coverage_by_fk_trip_id(fk_trip_id, debug)
- async function liradb_get_multilinestring_from_coverage_by_uuid(uuid, debug)
- async function liradb_get_timestamp(uuid, debug)
- async function db_check_if_surveyID_exists(survey_id, debug)
- async function liradb_get_rowCount_and_all_uuids_for_coverage(debug)
- async function liradb_get_corverage_entry_by_uuid(uuid, debug)
- async function liradb_get_way_entry_by_uuid(uuid, debug)
- async function db_check_osm_id_and_get_uuid_in_way_tabel(osm_id, buff_length, debug)
- async function liradb_get_end_time_by_fk_trip_id(fk_trip_id, debug)
- async function liradb_get_coverage_values_by_fk_coverage_id(uuid, debug)
- async function liradb_get_type_and_value_for_coverage_values_entry_by_uuid(uuid, debug)
- async function db_insert_lira_data_in_measurement_table(type_index, value, timestamp, distance_way, fk_way_id, debug)

## Content of AvailArr 0. Crack detection module

0. Cracking Module
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
