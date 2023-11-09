import { FC, useCallback, useEffect, useState } from 'react';
import { IRoad } from '../models/path';
import { getRoads } from '../queries/road';
import { LatLng } from '../models/models';

import ConditionsMap from '../Components/Conditions/ConditionsMap';
import Search from '../Components/Map/Inputs/Search';
import ForceMapUpdate from '../Components/Map/ForceMapUpdate';
import Roads from '../Components/Map/Roads';
import {
  ConditionTypeOptions,
  SeverityOptions,
  DateRange,
  YearMonth,
  MultiMode,
  DefaultMode,
  SeverityMode,
  DefaultSeverityMode,
} from '../models/conditions';
import MonthFilter from '../Components/Map/Inputs/MonthFilter';
import MultiSelector from '../Components/Map/Inputs/MultiSelector';
import '../css/navbar.css';

/**
 * Component rendering the main page
 */
const Main: FC = () => {
  // The roads loaded from the database
  const [roads, setRoads] = useState<IRoad[]>();
  // The position to move too (used by the Search component)
  const [moveToPosition, setMoveToPosition] = useState<LatLng>();
  // The indicator(s) to display on the map
  const [multiMode, setMultiMode] = useState<MultiMode>(DefaultMode);
  // The selected range of date (used to filter the data to show)
  const [rangeSelected, setRangeSelected] = useState<DateRange>({});
  // The selected severity of condition to display on the map
  const [severitySelected, setSeveritySelected] =
    useState<SeverityMode>(DefaultSeverityMode);

  /**
   *
   * @param date , returned from MonthFilter
   * @returns date in YearMonth format
   *
   * @author Hansen
   */

  function dateChange(date: any) {
    const YearMonth: YearMonth = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    };

    return YearMonth;
  }

  /**
   *
   * @param d , the date in YearMonth format
   * @param start , boolean specifying if the start point (true) or end point (false) of the range should be set.
   *
   * @author Hansen
   */

  const rangeChange = (d: YearMonth, start: boolean) => {
    setRangeSelected((old) => {
      if (start) {
        old.start = d;
      } else {
        old.end = d;
      }
      return old;
    });
  };

  // get the actual roads
  useEffect(() => {
    getRoads(setRoads);
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
      count: value.length + 0,
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
   * Function severitySet for setting the mode
   * to filter data on the map.
   *
   * @param selected, the object returned from the MultiSelector
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
      outputMode.selected = false;
    }
    console.log(outputMode);
    setSeveritySelected(outputMode);
  }, []);

  return (
    <div style={{ height: '100%' }}>
      <div className="nav-wrapper">
        <div className="nav-container">
          <Search
            onPlaceSelect={(value: any) => {
              console.log(value);
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
            onStartChange={(date: any) => {
              rangeChange(dateChange(date), true);
            }}
            onEndChange={(date: any) => {
              rangeChange(dateChange(date), false);
            }}
          />
          <p className="labelling"> Start Date → End Date</p>
        </div>
      </div>
      <ConditionsMap
        multiMode={multiMode!}
        rangeSelected={rangeSelected}
        severitySelected={severitySelected}
      >
        <Roads roads={roads} />
        <ForceMapUpdate position={moveToPosition} />
      </ConditionsMap>
    </div>
  );
};

export default Main;
