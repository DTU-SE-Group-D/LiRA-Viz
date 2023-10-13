import { useEffect, useState } from 'react';

import '../css/road_details.css'; // Import the CSS file
import MapArea from '../Components/RoadDetails/MapArea';
import RoadImage from '../Components/RoadDetails/RoadImage';
import TopBar from '../Components/RoadDetails/TopBar';
import Split from 'react-split';
import ConditionsGraph from '../Components/RoadDetails/ConditionsGraph';
import { ChartData } from 'chart.js';
import { getConditionsWay } from '../queries/conditions';
import '../css/split.css';

const RoadDetails = () => {
  const [showMapImageMode, setShowRoadImageMode] = useState(false);
  const [wayData, setWayData] =
    useState<ChartData<'scatter', number[], number>>();
  const [triggerUpdate, setTriggerUpdate] = useState<number>(0);

  useEffect(() => {
    getConditionsWay('0cba0666-d75e-45bd-9da6-62ef0fe9544c', (wc) => {
      console.log(wc);
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
            // tension: 0.05,
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
            // tension: 0.5,
            data: wc.map((p) => p.DI),
            yAxisID: 'DI',
          },
        ],
      });
    });
  }, []);

  return (
    <div>
      <TopBar isToggleOn={setShowRoadImageMode} />
      <Split
        className="split"
        direction="vertical"
        sizes={[45, 55]}
        minSize={150}
        snapOffset={10}
        onDragEnd={() => {
          setTriggerUpdate((prev) => prev + 1);
        }}
      >
        <div>
          {showMapImageMode ? (
            <RoadImage />
          ) : (
            <MapArea triggerUpdate={triggerUpdate} />
          )}
        </div>
        <ConditionsGraph data={wayData} />
      </Split>
      ,
    </div>
  );
};

export default RoadDetails;
