import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import '../css/road_details.css'; // Import the CSS file
import MapArea from '../Components/RoadDetails/MapArea';
import RoadImage from '../Components/RoadDetails/RoadImage';
import TopBar from '../Components/RoadDetails/TopBar';
import Split from '@uiw/react-split';
import ConditionsGraph from '../Components/RoadDetails/ConditionsGraph';
import { getSurveyData } from '../queries/conditions';
import '../css/split.css';
import { ConditionsGraphData } from '../models/conditions';
import '../css/inspect_page.css';
import { useParams } from 'react-router-dom';
import { ImageType, LatLng, SurveyConditions } from '../models/models';
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
 * @author Muro, Chen, Hansen
 */
const Inspect: FC = () => {
  /** The id and type of the object to display (in the url) */
  const { id, type } = useParams();
  /** The sizes for the split components */
  const [topPanelSize, setTopPanelSize] = useState(35);
  const [conditionsGraphSize, setConditionsGraphSize] = useState(
    65 - (10 / window.innerWidth) * 100,
  );
  const [roadDistanceLeftToRight, setRoadDistanceLeftToRight] = useState<
    number[] | null
  >([0, 0]);

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
  /** The data from Survey */
  const [surveyData, setSurveyData] = useState<SurveyConditions[]>();
  /** The indicator type to display data on graph*/
  const [graphIndicatorType, setGraphIndicatorType] = useState<string[]>([]);
  const [availableImagesTypes, setAvailableImagesTypes] = useState<string[]>(
    [],
  );

  const availableGraphIndicatorType = useMemo(() => {
    return Array.from(new Set(surveyData?.map((item) => item.type)));
  }, [surveyData]);

  const indicatorSet = useCallback((value: string[]) => {
    setGraphIndicatorType(
      value
        .map((e: any) => e.value)
        .toString()
        .split(','),
    );
  }, []);

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
            { value: 0, way_dist: 1 },
          ],
        });
        //===== Center the map
        const geo = survey.geometry;
        setMapCenter({
          lat: geo[Math.floor(geo.length / 2)][1],
          lng: geo[Math.floor(geo.length / 2)][0],
        });
        //===== Update the chart data
        const surveyData = survey.data;
        if (surveyData !== undefined) {
          setSurveyData(surveyData);
        }
      });
    }
  }, [id, type]);

  useEffect(() => {
    const conditionsGraphAllDataSets: ConditionsGraphData[] = [];
    const survey = surveyData;

    if (survey !== undefined && conditionsGraphAllDataSets !== undefined) {
      for (let i = 0; i < graphIndicatorType.length; i++) {
        const rowOfData = survey.filter(
          (item) => item.type === graphIndicatorType[i],
        );
        //check if rowOfData is empty
        if (rowOfData.length === 0) continue;
        const conditionsGraphSingleDataSet: ConditionsGraphData = {
          type: graphIndicatorType[i],
          dataValues: rowOfData.map((item) => ({
            x: item.distance_survey,
            y: item.value,
          })),
          minY: Math.min(...rowOfData.map((item) => item.value)),
          maxY: Math.max(...rowOfData.map((item) => item.value)),
          minX: Math.min(...rowOfData.map((item) => item.distance_survey)) - 1,
          maxX: Math.max(...rowOfData.map((item) => item.distance_survey)) + 1,
        };
        conditionsGraphAllDataSets.push(conditionsGraphSingleDataSet);
      }
      setChartData(conditionsGraphAllDataSets);
    }
  }, [graphIndicatorType]);

  useEffect(() => {
    if (gradientLineData === undefined || roadDistanceLeftToRight === null)
      return;
    setGradientLineData({
      geometry: gradientLineData.geometry,

      data: roadDistanceLeftToRight[0]
        ? [
            { value: 0, way_dist: roadDistanceLeftToRight[0] - 0.01 },
            { value: 1, way_dist: roadDistanceLeftToRight[0] },
            { value: 1, way_dist: roadDistanceLeftToRight[1] },
            { value: 0, way_dist: roadDistanceLeftToRight[1] + 0.01 },
          ]
        : [
            { value: 0, way_dist: 0 },
            { value: 0, way_dist: roadDistanceLeftToRight[0] - 0.01 },
            { value: 1, way_dist: roadDistanceLeftToRight[0] },
            { value: 1, way_dist: roadDistanceLeftToRight[1] },
            { value: 0, way_dist: roadDistanceLeftToRight[1] + 0.01 },
          ],
    });
  }, [roadDistanceLeftToRight]);

  //sets the collapse function for the split component
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

  //sets the collapse function for the split component
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
    <div className="inspect-page">
      <TopBar
        setSelectedType={setSelectedType}
        availableRoadImagesTypes={availableImagesTypes}
        graphIndicatorSet={indicatorSet}
        availableGraphIndicatorType={availableGraphIndicatorType}
      />
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
              <RoadImage
                id={id}
                type={type}
                selectedType={selectedType}
                setImagesTypes={setAvailableImagesTypes}
                onRoadDistanceChange={setRoadDistanceLeftToRight}
              />
            </div>
          </Split>
        </div>
        <div
          style={{
            height: `calc(${conditionsGraphSize}% - ${halfSizeOfSplitBar})`,
          }}
        >
          <ConditionsGraph
            data={chartData}
            inspectedRoadDistanceArea={roadDistanceLeftToRight}
          />
        </div>
      </Split>
    </div>
  );
};

export default Inspect;
