import { useState } from 'react';
import { ChartData } from 'chart.js';
//
import ConditionsMap from '../Components/RoadConditions/ConditionsMap';
import ConditionsGraph from '../Components/RoadConditions/ConditionsGraph';

import { GraphProvider } from '../context/GraphContext';

import '../css/road_conditions.css';
import { ConditionType } from '../models/graph';

//this is to visualise the Road Conditions (GP) map
const RoadConditions = () => {
  const [wayData, setWayData] = useState<ChartData<'line', number[], number>>();

  console.log(wayData);

  const type: ConditionType = {
    name: 'IRI',
    min: 0,
    max: 10,
    grid: true,
    samples: 40,
  };

  return (
    <GraphProvider>
      <div className="road-conditions-wrapper">
        <ConditionsMap type={type} setWayData={setWayData} />
        {/*<ConditionsGraph type={type} data={wayData} />*/}
        <ConditionsGraph />
      </div>
    </GraphProvider>
  );
};

export default RoadConditions;
