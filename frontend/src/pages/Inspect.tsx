import { FC, useEffect, useState } from 'react';

import '../css/road_details.css'; // Import the CSS file
import MapArea from '../Components/RoadDetails/MapArea';
import RoadImage from '../Components/RoadDetails/RoadImage';
import TopBar from '../Components/RoadDetails/TopBar';
import Split from '@uiw/react-split';
import ConditionsGraph from '../Components/RoadDetails/ConditionsGraph';
import { getConditionsSurvey } from '../queries/conditions';
import '../css/split.css';
import { ConditionsGraphData, conditionTypes } from '../models/conditions';
import { useParams } from 'react-router-dom';

/**
 * Inspect Page showing the map, road images and the chart graph with multiple Split components to resize them
 * @author Muro, Chen
 */
const Inspect: FC = () => {
  const [chartData, setChartData] = useState<ConditionsGraphData[]>();
  const [triggerUpdate, setTriggerUpdate] = useState<number>(0);
  const [topPanelSize, setTopPanelSize] = useState(35);
  const [conditionsGraphSize, setConditionsGraphSize] = useState(
    65 - (10 / window.innerWidth) * 100,
  );

  const [mapAreaSize, setMapAreaSize] = useState(35);
  const [roadImageSize, setRoadImageSize] = useState(65);
  const { id, type } = useParams();

  useEffect(() => {
    console.log(id);
    if (id && type === 'surveys') {
      getConditionsSurvey(id, (surveyData) => {
        const conditionsGraphAllDataSets: ConditionsGraphData[] = [];

        for (const indicator of conditionTypes) {
          const rowOfData = surveyData.filter(
            (item) => item.type === indicator,
          );
          //check if rowOfData is empty
          if (rowOfData.length === 0) continue;
          const conditionsGraphSingleDataSet: ConditionsGraphData = {
            type: indicator,
            dataValues: rowOfData.map((item) => ({
              x: item.distance_survey,
              y: item.value,
            })),
            minY: Math.min(...rowOfData.map((item) => item.value)),
            maxY: Math.max(...rowOfData.map((item) => item.value)),
            minX:
              Math.min(...rowOfData.map((item) => item.distance_survey)) - 1,
            maxX:
              Math.max(...rowOfData.map((item) => item.distance_survey)) + 1,
          };
          conditionsGraphAllDataSets.push(conditionsGraphSingleDataSet);
        }

        setChartData(conditionsGraphAllDataSets);
      });
    }
  }, [id, type]);

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
        onDragEnd={(sizeTop: number) => {
          handleTopPanelSizeChange(sizeTop);
          setTriggerUpdate((prev) => prev + 1);
        }}
      >
        <div style={{ height: `${topPanelSize}%` }}>
          <Split
            mode="horizontal"
            onDragEnd={(sizeLeft: number) => {
              handleMapAreaSizeChange(sizeLeft);
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
          <ConditionsGraph data={chartData} />
        </div>
      </Split>
    </div>
  );
};

export default Inspect;
