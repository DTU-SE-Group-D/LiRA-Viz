import { ChartData } from 'chart.js';

import ConditionsMap from '../Components/RoadConditions/ConditionsMap';
import ConditionsGraph from '../Components/RoadConditions/ConditionsGraph';

import { GraphProvider } from '../context/GraphContext';

import Split from 'react-split';

import '../css/split.css';
import '../css/road_conditions.css';
import { ConditionType } from '../models/graph';
import React, { useEffect, useState } from 'react';

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
      <Split
        className="split"
        direction="vertical"
        sizes={[45, 55]}
        minSize={150}
        snapOffset={10}
        // dragInterval={50}
      >
        <ConditionsMap type={type} setWayData={setWayData} />
        {/*<ConditionsGraph type={type} data={wayData} />**/}
        <ConditionsGraph />
      </Split>
    </GraphProvider>
  );
};

export default RoadConditions;
