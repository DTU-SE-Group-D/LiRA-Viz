import { useEffect, useState } from 'react';

import '../css/road_details.css'; // Import the CSS file
import MapArea from '../Components/RoadDetails/MapArea';
import RoadImage from '../Components/RoadDetails/RoadImage';
import TopBar from '../Components/RoadDetails/TopBar';
import Split from '@uiw/react-split';
import ConditionsGraph from '../Components/RoadDetails/ConditionsGraph';
import { ChartData } from 'chart.js';
import { getConditionsWay } from '../queries/conditions';
import '../css/split.css';

const RoadDetails = () => {
  const [showMapImageMode, setShowRoadImageMode] = useState(false);
  const [wayData, setWayData] =
    useState<ChartData<'scatter', number[], number>>();
  const [minAndMax, setMinAndMax] = useState<number[]>([1, 1, 0, 0]);
  const [triggerUpdate, setTriggerUpdate] = useState<number>(0);

  useEffect(() => {
    getConditionsWay('0cba0666-d75e-45bd-9da6-62ef0fe9544c', (wc) => {
      console.log(wc);

      // Extract 'KPI' and 'DI' data arrays
      const KPIData = wc.map((p) => p.KPI);
      const DIData = wc.map((p) => p.DI);

      // Find max and min values for 'KPI' and 'DI'
      const minKPI = Math.min(...KPIData);
      const maxKPI = Math.max(...KPIData);
      const maxDI = Math.max(...DIData);
      const minDI = Math.min(...DIData);

      setMinAndMax([minKPI, maxKPI, minDI, maxDI]);

      setWayData({
        labels: wc.map((p) => p.way_dist * 100),
        datasets: [
          {
            type: 'scatter' as const,
            showLine: true,
            label: 'KPI',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 2,
            fill: false,
            data: wc.map((p) => p.KPI),
            yAxisID: 'KPI',
          },
          {
            type: 'scatter' as const,
            showLine: true,
            label: 'DI',
            borderColor: 'rgb(120, 245, 23)',
            borderWidth: 2,
            fill: false,
            data: wc.map((p) => p.DI),
            yAxisID: 'DI',
          },
        ],
      });
    });
  }, []);

  return (
    <div style={{ height: '100vh' }}>
      <TopBar isToggleOn={setShowRoadImageMode} />
      <Split
        mode="vertical"
        className="split"
        onDragEnd={() => {
          setTriggerUpdate((prev) => prev + 1);
        }}
      >
        <div style={{ height: '40%' }}>
          <Split
            mode="horizontal"
            onDragEnd={() => {
              setTriggerUpdate((prev) => prev + 1);
            }}
          >
            <MapArea triggerUpdate={triggerUpdate} />
            <RoadImage />
          </Split>
        </div>
        <div style={{ height: '60%' }}>
          <ConditionsGraph data={wayData} minAndMax={minAndMax} />
        </div>
      </Split>
    </div>
  );
};

export default RoadDetails;
