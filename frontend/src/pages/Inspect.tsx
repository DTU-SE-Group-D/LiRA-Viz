import { FC, useCallback, useEffect, useState } from 'react';

import '../css/road_details.css'; // Import the CSS file
import MapArea from '../Components/RoadDetails/MapArea';
import RoadImage from '../Components/RoadDetails/RoadImage';
import TopBar from '../Components/RoadDetails/TopBar';
import Split from '@uiw/react-split';
import ConditionsGraph from '../Components/RoadDetails/ConditionsGraph';
import { getSurveyData } from '../queries/conditions';
import '../css/split.css';
import { ConditionsGraphData, conditionTypes } from '../models/conditions';
import { useParams } from 'react-router-dom';
import { ImageType, LatLng } from '../models/models';
import { Palette } from 'react-leaflet-hotline';
import { LatLng as LatLngLeaflet } from 'leaflet';
import GradientLine from '../Components/Map/GradientLine';
import { DataPoint } from '../models/path';

// See in ../css/split.css
const halfSizeOfSplitBar = '5px';

const palette: Palette = [
  { t: 0, r: 0, g: 0, b: 255 },
  { t: 0.9, r: 0, g: 0, b: 255 },
  { t: 1, r: 0, g: 255, b: 0 },
];

/**
 * Inspect Page showing the map, road images and the chart graph with multiple Split components to resize them
 * @author Muro, Chen
 */
const Inspect: FC = () => {
  /** The id and type of the object to display (in the url) */
  const { id, type } = useParams();
  /** The sizes for the split components */
  const [topPanelSize, setTopPanelSize] = useState(35);
  const [conditionsGraphSize, setConditionsGraphSize] = useState(
    65 - (10 / window.innerWidth) * 100,
  );
  const [mapAreaSize, setMapAreaSize] = useState(35);
  const [roadImageSize, setRoadImageSize] = useState(65);
  /** The trigger and mapCenter to update and move the map */
  const [triggerUpdate, setTriggerUpdate] = useState<number>(0);
  const [mapCenter, setMapCenter] = useState<LatLng>();
  /** The type of the image to display */
  const [selectedType, setSelectedType] = useState<string>(ImageType.ImageInt);
  /** The data for the chart graph */
  const [chartData, setChartData] = useState<ConditionsGraphData[]>();
  /** The data for the gradient line */
  const [gradientLineData, setGradientLineData] = useState<{
    geometry: LatLngLeaflet[];
    data: DataPoint[];
  }>();
  const [s, setS] = useState<number>(0);

  useEffect(() => {
    if (id && type === 'surveys') {
      getSurveyData(id, (survey) => {
        //===== Update the gradient line data
        setGradientLineData({
          geometry: survey.geometry.map(
            (item): LatLngLeaflet => new LatLngLeaflet(item[1], item[0]),
          ),
          data: [
            { value: 0, way_dist: 0 },
            { value: 0.1, way_dist: 1 },
          ],
        });
        setS((prev) => prev + 1);
        //===== Center the map
        const geo = survey.geometry;
        setMapCenter({
          lat: geo[Math.floor(geo.length / 2)][1],
          lng: geo[Math.floor(geo.length / 2)][0],
        });
        //===== Update the chart data
        const surveyData = survey.data;
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

  // TODO: update the gradient line data when the user moves the road surface images
  useEffect(() => {
    if (gradientLineData === undefined) return;

    setGradientLineData({
      geometry: gradientLineData.geometry,
      data: [
        { value: 0, way_dist: 0 },
        { value: 0.9, way_dist: 499 },
        { value: 1, way_dist: 500 },
        { value: 1, way_dist: 525 },
        { value: 0.9, way_dist: 526 },
      ],
    });
  }, [s]);

  const handleTopPanelSizeChange = useCallback((size: number) => {
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
  }, []);

  const handleMapAreaSizeChange = useCallback((size: number) => {
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
  }, []);

  return (
    <div>
      <TopBar setSelectedType={setSelectedType} />
      <Split
        mode="vertical"
        className="split"
        onDragEnd={(sizeTop) => {
          handleTopPanelSizeChange(sizeTop);
          setTriggerUpdate((prev) => prev + 1);
        }}
      >
        <div
          style={{ height: `calc(${topPanelSize}% - ${halfSizeOfSplitBar})` }}
        >
          <Split
            mode="horizontal"
            onDragEnd={(sizeLeft) => {
              handleMapAreaSizeChange(sizeLeft);
              setTriggerUpdate((prev) => prev + 1);
            }}
          >
            <div
              style={{ width: `calc(${mapAreaSize}% - ${halfSizeOfSplitBar})` }}
            >
              <MapArea triggerUpdate={triggerUpdate} center={mapCenter}>
                <GradientLine
                  geometry={gradientLineData?.geometry}
                  data={gradientLineData?.data}
                  palette={palette}
                  minValue={0}
                  maxValue={1}
                  addZeroDataPointAtTheEnd={true}
                  onClick={(way_id) => {
                    console.log('GradientLine clicked, ', way_id);
                  }}
                />
              </MapArea>
            </div>
            <div
              style={{
                width: `calc(${roadImageSize}% - ${halfSizeOfSplitBar})`,
              }}
            >
              <RoadImage id={id} type={type} selectedType={selectedType} />
            </div>
          </Split>
        </div>
        <div
          style={{
            height: `calc(${conditionsGraphSize}% - ${halfSizeOfSplitBar})`,
          }}
        >
          <ConditionsGraph data={chartData} />
        </div>
      </Split>
    </div>
  );
};

export default Inspect;
