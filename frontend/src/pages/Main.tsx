import { FC, useCallback, useEffect, useState } from 'react';
import Hamburger from '../Components/Map/Inputs/Hamburger';
import { IRoad, WayId } from '../models/path';
import { getRoadsPaths, getWayLength } from '../queries/road';
import { LatLng, SurveyListItem } from '../models/models';
import { FeatureCollection } from 'geojson';
import { getAllConditions } from '../queries/conditions';

import ConditionsMap from '../Components/Conditions/ConditionsMap';
import Search from '../Components/Map/Inputs/Search';
import ForceMapUpdate from '../Components/Map/Hooks/ForceMapUpdate';
import Paths from '../Components/Map/Paths';
import {
  ConditionTypeOptions,
  dateChange,
  DateRange,
  DefaultMode,
  DefaultSeverityMode,
  lessOrEqualThan,
  MultiMode,
  SeverityMode,
  SeverityOptions,
  YearMonth,
} from '../models/conditions';
import MonthFilter from '../Components/Map/Inputs/MonthFilter';
import MultiSelector from '../Components/Map/Inputs/MultiSelector';
import '../css/navbar.css';
import DetectMapClick from '../Components/Map/Hooks/DetectMapClick';
import InfoCard from '../Components/Map/InfoCard';
import { useNavigate } from 'react-router-dom';
import InfoButton from '../Components/Conditions/InfoButton';
import UploadPanel from '../Components/Conditions/UploadPanel';
import ProgressCircle from '../Components/ProgressCircle';

/**
/* Function to calculate the zoom level
/*
/* @author Chen
*/
const calculateZoomLevel = (maxDistance: number): number => {
  let slope = -7.8e-5; // Default
  let intercept = 12.6; // Default
  if (maxDistance <= 900) {
    slope = -7.8e-5;
    intercept = 16.5;
  } else if (maxDistance > 900 && maxDistance <= 2500) {
    slope = -7.8e-5;
    intercept = 14.1;
  } else if (maxDistance > 2500 && maxDistance <= 8000) {
    slope = -7.9e-5;
    intercept = 13.8;
  } else if (maxDistance > 8000 && maxDistance <= 20000) {
    slope = -7.8e-5;
    intercept = 14;
  } else if (maxDistance > 20000 && maxDistance <= 40000) {
    slope = -6.7e-5;
    intercept = 14;
  } else if (maxDistance > 40000 && maxDistance <= 100000) {
    slope = -5e-5;
    intercept = 14;
  } else {
    return 10;
  }
  const ZoomInParam = slope * maxDistance + intercept;
  return ZoomInParam;
};

/**
 * Component rendering the main page
 *
 * @author Hansen, Kerbourc'h
 */
const Main: FC = () => {
  // The roads loaded from the database
  const [roads, setRoads] = useState<IRoad[]>();
  // Select road index
  const [selectedRoadIdx, setSelectedRoadIdx] = useState<number>(-1);
  // Selected survey
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyListItem | null>(
    null,
  );

  // describe the current state of the sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // open upload panel
  const [isUploadPanelOpened, setIsUploadPanelOpened] = useState(false);

  // The position to move too (used by the Search component)
  const [moveToPosition, setMoveToPosition] = useState<LatLng>();
  // The indicator(s) to display on the map
  const [multiMode, setMultiMode] = useState<MultiMode>(DefaultMode);
  // The selected range of date (used to filter the data to show)
  const [rangeSelected, setRangeSelected] = useState<DateRange>({});
  // The selected severity (used to filter the data to show)
  const [severitySelected, setSeveritySelected] =
    useState<SeverityMode>(DefaultSeverityMode);

  // All the data, get from the backend
  const [dataAll, setDataAll] = useState<FeatureCollection>();
  // The date range across which the data is
  const [rangeAll, setRangeAll] = useState<DateRange>({});
  // Stores the minimum and maximum of the date range
  const [dateMin, setDateMin] = useState<Date>();
  const [dateMax, setDateMax] = useState<Date>();

  // Stores whether or not loading spinner should show
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate(); // Get the navigate function

  /**
   *
   * @param d , the date in YearMonth format from the MonthFilter selector
   * @param start , boolean specifying if the start point (true) or end point (false) of the range should be set.
   *
   * @author Hansen
   */
  const rangeChange = useCallback((d: YearMonth, start: boolean) => {
    setRangeSelected((old) => {
      if (start) {
        return { ...old, start: d };
      } else {
        return { ...old, end: d };
      }
    });
  }, []);

  /**
   * Function multiModeSet for setting the mode
   * to filter data on the map.
   *
   * @param selected, the object returned from the MultiSelector
   *
   * @author Hansen
   */
  const multiModeSet = useCallback((value: string[]) => {
    const outputMode: MultiMode = {
      count: value.length,
      mode: value
        .map((e: any) => e.label)
        .toString()
        .split(','),
      ALL: value.some((e: any) => e.value === 'ALL'),
    };

    if (outputMode.count === 0) {
      outputMode.mode = [' '];
      outputMode.ALL = false;
    } else if (outputMode.ALL) {
      outputMode.mode = ['KPI', 'DI', 'IRI', 'Mu', 'E_norm'];
      outputMode.count = outputMode.mode.length;
    }
    setMultiMode(outputMode);
  }, []);

  /**
   * Function severitySet for setting the severity
   * to filter data on the map.
   *
   * @param value, the object returned from the Severity MultiSelector
   *
   * @author Hansen
   */
  const severitySet = useCallback((value: string[]) => {
    const outputMode: SeverityMode = {
      mode: value
        .map((e: any) => e.label)
        .toString()
        .split(','),
    };
    if (value.length > 0) {
      outputMode.selected = true;
    } else {
      outputMode.mode = undefined;
      outputMode.selected = false;
    }
    setSeveritySelected(outputMode);
  }, []);

  // get the actual roads
  useEffect(() => {
    getRoadsPaths(setRoads);
  }, []);

  useEffect(() => {
    setLoading(true);
    // Load the conditions from the backend
    getAllConditions((data) => {
      const range: DateRange = {};

      let minDate: Date | undefined;
      let maxDate: Date | undefined;

      data.features.forEach((f) => {
        if (f.properties !== null && f.properties.valid_time !== undefined) {
          const date = new Date(f.properties.valid_time);
          const yearMonth: YearMonth = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
          };
          f.properties.valid_yearmonth = yearMonth;
          if (range.start === undefined) {
            range.start = yearMonth;
          } else if (!lessOrEqualThan(range.start, yearMonth)) {
            range.start = yearMonth;
          }
          if (range.end === undefined) {
            range.end = yearMonth;
          } else if (!lessOrEqualThan(yearMonth, range.end)) {
            range.end = yearMonth;
          }

          if (minDate === undefined || date < minDate) {
            minDate = date;
          }

          if (maxDate === undefined || date > maxDate) {
            maxDate = date;
          }
        }
      });
      setDataAll(data);
      setRangeAll(range);

      setDateMin(minDate);
      setDateMax(maxDate);

      setLoading(false);
    });
  }, []);

  // Control Zoom level by the length of roads when selecting a road on the map
  const [zoomLevel, setZoomLevel] = useState<number>(13); // Default zoom level
  const [wayLength, setWayLength] = useState<number | null>(null);

  /**
     /* Function to calculate the total length of roads
     /*
     /* @author Chen
     */
  const fetchAndSumWayLengths = useCallback(
    async (branches: WayId[][]) => {
      try {
        const promises = branches.flat().map(
          (wayId) =>
            new Promise<number>((resolve) => {
              getWayLength(wayId, resolve);
            }),
        );
        const lengths = await Promise.all(promises);
        const totalLength = lengths.reduce((sum, length) => sum + length, 0);
        setWayLength(totalLength);
      } catch (error) {
        console.error('Error fetching way lengths:', error);
        setWayLength(0);
      }
    },
    [getWayLength, setWayLength],
  );

  // Zoom in when calling onSelectedPath
  useEffect(() => {
    if (wayLength !== null) {
      const zoom = calculateZoomLevel(wayLength);
      setZoomLevel(zoom);
    }
  }, [wayLength]);

  return (
    <>
      <div className="nav-wrapper">
        <Hamburger
          isOpen={isSidebarOpen}
          toggle={() => setIsSidebarOpen(!isSidebarOpen)}
          setSelectedSurvey={(survey) => {
            const coord =
              survey.geometry[Math.floor(survey.geometry.length / 2)];
            setMoveToPosition({ lat: coord[1], lng: coord[0] });

            setSelectedSurvey(survey);
          }}
        />
        <div className="nav-container">
          <Search
            onPlaceSelect={(value: any) => {
              const osm_id = value?.properties?.datasource?.raw?.osm_id;
              if (osm_id && roads) {
                for (let idx = 0; idx < roads.length; idx++) {
                  if (
                    Object.keys(roads[idx].geometries).includes(String(osm_id))
                  ) {
                    setSelectedRoadIdx(idx);
                    break;
                  }
                }
              }

              const coordinates = value?.geometry?.coordinates;
              if (coordinates) {
                const position = {
                  lat: coordinates[Math.floor(coordinates.length / 2)][1],
                  lng: coordinates[Math.floor(coordinates.length / 2)][0],
                };
                setMoveToPosition(position);
              }
            }}
          />
        </div>
        <div className="filter-container">
          <MultiSelector
            options={ConditionTypeOptions}
            placeholder="Condition Types"
            handleSelectionChange={multiModeSet}
            defaultValue={ConditionTypeOptions[0]}
          ></MultiSelector>
        </div>
        <div className="filter-container">
          <MultiSelector
            placeholder="Severity"
            handleSelectionChange={severitySet}
            defaultValue={null}
            options={SeverityOptions}
          ></MultiSelector>
        </div>
        <div className="picker-container">
          <MonthFilter
            minDate={dateMin!}
            maxDate={dateMax!}
            onStartChange={(date: any) => {
              rangeChange(dateChange(date), true);
            }}
            onEndChange={(date: any) => {
              rangeChange(dateChange(date), false);
            }}
          />
          <p className="labelling"> Start Date → End Date</p>
        </div>
        <div className="upload-btn-container">
          <button
            onClick={() => {
              setIsUploadPanelOpened((prev) => !prev);
            }}
          >
            Upload
          </button>
        </div>
      </div>
      <ConditionsMap
        multiMode={multiMode}
        rangeSelected={rangeSelected}
        severitySelected={severitySelected}
        dataAll={dataAll!}
        rangeAll={rangeAll}
      >
        <Paths
          paths={
            roads === undefined ||
            (selectedRoadIdx === -1 && selectedSurvey == null)
              ? roads?.map((r) => Object.values(r.geometries))
              : selectedSurvey == null
                ? roads[selectedRoadIdx].branches.map((OSMIds) => {
                    const path: LatLng[] = [];

                    for (const OSMId of OSMIds) {
                      path.push(
                        ...Object.values(
                          roads[selectedRoadIdx].geometries[OSMId],
                        ),
                      );
                    }
                    return path;
                  })
                : [
                    selectedSurvey.geometry.map((coord) => ({
                      lat: coord[1],
                      lng: coord[0],
                    })),
                  ]
          }
          onSelectedPath={(index, _road, position) => {
            if (roads === undefined) return;

            if (selectedRoadIdx === -1 && selectedSurvey == null) {
              // If no road is selected, select the road
              setSelectedRoadIdx(index);
              // Get information of road branches for Zoom in
              const selectedRoad = roads[index];
              const Branches = selectedRoad.branches;
              fetchAndSumWayLengths(Branches); // Call fetchAndSumWayLengths to calculate parameters and zoom in
            } else if (selectedRoadIdx != -1) {
              // if a road is selected, go to the inspect page for the clicked road branch
              navigate(
                '/inspect/paths/' +
                  roads[selectedRoadIdx].branches[index].join(','),
                { state: { name: roads[selectedRoadIdx].way_name } },
              );
            } else {
              // if it was a survey that was selected
              navigate(`/inspect/surveys/${selectedSurvey!.id}`, {
                state: {
                  name: `${selectedSurvey!.dynatest_id} (${new Date(
                    selectedSurvey!.timestamp,
                  ).toLocaleDateString()})`,
                },
              });
            }
            setMoveToPosition(position);
          }}
        />
        <DetectMapClick
          onClick={() => {
            if (selectedRoadIdx !== -1) {
              setSelectedRoadIdx(-1);
            }

            if (selectedSurvey != null) {
              setSelectedSurvey(null);
            }
          }}
        />
        <ForceMapUpdate position={moveToPosition} zoomLevel={zoomLevel} />
      </ConditionsMap>
      {isUploadPanelOpened && (
        <UploadPanel
          close={() => {
            setIsUploadPanelOpened(false);
          }}
        />
      )}
      <InfoCard
        hidden={selectedRoadIdx === -1 && selectedSurvey == null}
        roadData={
          selectedRoadIdx !== -1 && roads ? roads[selectedRoadIdx] : undefined
        }
        surveyData={selectedSurvey == null ? undefined : selectedSurvey}
      />
      <ProgressCircle isLoading={loading} />
      <InfoButton />
    </>
  );
};

export default Main;
