import { FC, useEffect, useState } from 'react';

import '../css/road_details.css'; // Import the CSS file
import MapArea from '../Components/RoadDetails/MapArea';
import RoadImage from '../Components/RoadDetails/RoadImage';
import TopBar from '../Components/RoadDetails/TopBar';
import Split from '@uiw/react-split';
import ConditionsGraph from '../Components/RoadDetails/ConditionsGraph';
import { ChartData } from 'chart.js';
import { getConditionsWay } from '../queries/conditions';
import '../css/split.css';

/**
 * Inspect Page showing the map, road images and the chart graph with multiple Split components to resize them
 * @author Muro, Chen
 */
const Inspect: FC = () => {
  const [wayData, setWayData] =
    useState<ChartData<'scatter', number[], number>>();
  const [minAndMax, setMinAndMax] = useState<number[]>([1, 1, 0, 0]);
  const [triggerUpdate, setTriggerUpdate] = useState<number>(0);

  const [topPanelSize, setTopPanelSize] = useState(35);
  const [conditionsGraphSize, setConditionsGraphSize] = useState(
    65 - (10 / window.innerWidth) * 100,
  );

  const [mapAreaSize, setMapAreaSize] = useState(35);
  const [roadImageSize, setRoadImageSize] = useState(65);

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

  const handleTopPanelSizeChange = (size: number) => {
    if (size <= 10) {
      setTopPanelSize(0);
      setConditionsGraphSize(100 - (10 / window.innerHeight) * 100);
    } else if (size >= 90) {
      setConditionsGraphSize(0);
      setTopPanelSize(100 - (10 / window.innerHeight) * 100);
    } else {
      setTopPanelSize(size);
      setConditionsGraphSize(100 - size - (10 / window.innerHeight) * 100);
    }
  };

  const handleMapAreaSizeChange = (size: number) => {
    if (size <= 7) {
      setMapAreaSize(0);
      setRoadImageSize(100 - (10 / window.innerWidth) * 100);
    } else if (size >= 93) {
      setRoadImageSize(0);
      setMapAreaSize(100 - (10 / window.innerWidth) * 100);
    } else {
      setMapAreaSize(size);
      setRoadImageSize(100 - size - (10 / window.innerWidth) * 100);
    }
  };

  return (
    <div>
      <TopBar />
      <Split
        mode="vertical"
        className="split"
        onDragEnd={(sizeTop) => {
          handleTopPanelSizeChange(sizeTop);
          setTriggerUpdate((prev) => prev + 1);
        }}
      >
        <div style={{ height: `${topPanelSize}%` }}>
          <Split
            mode="horizontal"
            onDragEnd={(sizeLeft) => {
              handleMapAreaSizeChange(sizeLeft);
              // handleMapAreaSizeChange(sizeTopLeft);
              setTriggerUpdate((prev) => prev + 1);
            }}
          >
            <div style={{ width: `${mapAreaSize}%` }}>
              <MapArea triggerUpdate={triggerUpdate} />
            </div>
            <div style={{ width: `${roadImageSize}%` }}>
              <RoadImage />
            </div>
          </Split>
        </div>
        <div style={{ height: `${conditionsGraphSize}%` }}>
          <ConditionsGraph data={wayData} minAndMax={minAndMax} />
        </div>
      </Split>
    </div>
  );
};

export default Inspect;
