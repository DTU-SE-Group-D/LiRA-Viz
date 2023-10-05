import { ChartData } from 'chart.js';

import ConditionsMap from '../Components/RoadConditions/ConditionsMap';
import ConditionsGraph from '../Components/RoadConditions/ConditionsGraph';

import { GraphProvider } from '../context/GraphContext';

import Split from 'react-split';

import '../css/split.css';
import '../css/road_conditions.css';
import { ConditionType } from '../models/graph';
import { useEffect, useState } from 'react';
import { getConditionsWay2 } from '../queries/conditions';

//this is to visualise the Road Conditions (GP) map
const RoadConditions = () => {
  const [wayData, setWayData] =
    useState<ChartData<'scatter', number[], number>>();

  console.log(wayData);

  useEffect(() => {
    getConditionsWay2('12e920a5-368c-4484-a0a3-e8a626ec49fe', 'KPI', (wc) => {
      console.log(wc);
      setWayData({
        labels: wc.map((p) => p.way_dist * 100),
        datasets: [
          {
            //@ts-ignore
            type: 'line' as const,
            label: 'way_id',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 2,
            fill: false,
            tension: 0.2,
            data: wc.map((p) => p.value),
          },
        ],
      });
    });
  }, []);

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
        <ConditionsGraph type={type} data={wayData} />
      </Split>
    </GraphProvider>
  );
};

export default RoadConditions;
