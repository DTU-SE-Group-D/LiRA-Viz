import { ChartData } from 'chart.js';

import ConditionsMap from '../Components/RoadConditions/ConditionsMap';
import ConditionsGraph from '../Components/RoadConditions/ConditionsGraph';

import { GraphProvider } from '../context/GraphContext';

import Split from 'react-split';

import '../css/split.css';
import '../css/road_conditions.css';
import { useEffect, useState } from 'react';
import { getConditionsWay } from '../queries/conditions';

//this is to visualise the Road Conditions (GP) map
const RoadConditions = () => {
  const [wayData, setWayData] =
    useState<ChartData<'scatter', number[], number>>();
  const [triggerUpdate, setTriggerUpdate] = useState<number>(0);

  console.log(wayData);

  useEffect(() => {
    getConditionsWay('0cba0666-d75e-45bd-9da6-62ef0fe9544c', (wc) => {
      console.log(wc);
      setWayData({
        labels: wc.map((p) => p.way_dist * 100),
        datasets: [
          {
            //@ts-ignore
            type: 'line' as const,
            label: 'KPI',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 2,
            fill: false,
            tension: 0.2,
            data: wc.map((p) => p.KPI),
            yAxisID: 'KPI',
          },
          {
            //@ts-ignore
            type: 'line' as const,
            label: 'DI',
            borderColor: 'rgb(120, 245, 23)',
            borderWidth: 2,
            fill: false,
            tension: 0.2,
            data: wc.map((p) => p.DI),
            yAxisID: 'DI',
          },
        ],
      });
    });
  }, []);

  return (
    <GraphProvider>
      <Split
        className="split"
        direction="vertical"
        sizes={[45, 55]}
        minSize={150}
        snapOffset={10}
        onDragEnd={() => {
          setTriggerUpdate((prev) => prev + 1);
        }}
        // dragInterval={50}
      >
        <ConditionsMap triggerUpdate={triggerUpdate} />
        <ConditionsGraph data={wayData} />
      </Split>
    </GraphProvider>
  );
};

export default RoadConditions;
