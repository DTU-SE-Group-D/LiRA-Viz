import { FC, useEffect, useState } from 'react';
import { IRoad } from '../models/path';
import { getRoads } from '../queries/road';
import { LatLng } from '../models/models';

import ConditionsMap from '../Components/Conditions/ConditionsMap';
import Search from '../Components/Map/Inputs/Search';
import ForceMapUpdate from '../Components/Map/ForceMapUpdate';
import Roads from '../Components/Map/Roads';
import { conditionTypes, DateRange, YearMonth } from '../models/conditions';
import MonthFilter from '../Components/Map/Inputs/MonthFilter';
import Selector from '../Components/Map/Inputs/Selector';
import '../css/navbar.css';

/**
 * Component rendering the main page
 */
const Main: FC = () => {
  // The roads loaded from the database
  const [roads, setRoads] = useState<IRoad[]>();
  // The position to move too (used by the Search component)
  const [moveToPosition, setMoveToPosition] = useState<LatLng>();
  // The indicator to display on the map
  const [mode, setMode] = useState<string>('ALL');
  // The selected range of date (used to filter the data to show)
  const [rangeSelected, setRangeSelected] = useState<DateRange>({});

  function dateChange(date: any) {
    const YearMonth: YearMonth = {
      year: date.getFullYear(),
      month: date.getMonth() + 1, // +1 why
    };

    return YearMonth;
  }

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
          <Selector
            options={conditionTypes}
            onSelect={(_, name) => {
              setMode(name);
            }}
            defaultValue={'ALL'}
            label={'Condition Type'}
          />
        </div>
        <div className="filter-container">
          <Selector
            options={['ALL', 'Critical', 'High', 'Medium', 'Low']}
            onSelect={(e) => console.log(e)}
            label={' Severity '}
          />
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
      <ConditionsMap mode={mode} rangeSelected={rangeSelected}>
        <Roads roads={roads} />
        <ForceMapUpdate position={moveToPosition} />
      </ConditionsMap>
    </div>
  );
};

export default Main;
