import { FC, useEffect, useMemo, useState } from 'react';

import '../css/road_details.css'; // Import the CSS file
import MapArea from '../Components/RoadDetails/MapArea';
import RoadImage from '../Components/RoadDetails/RoadImage';
import TopBar from '../Components/RoadDetails/TopBar';
import Split from '@uiw/react-split';
import ConditionsGraph from '../Components/RoadDetails/ConditionsGraph';
import '../css/split.css';
import { ConditionsGraphData, conditionTypes } from '../models/conditions';
import '../css/inspect_page.css';
import { useParams } from 'react-router-dom';
import {
  Conditions,
  ImageType,
  LatLng,
  PathWithConditions,
} from '../models/models';
import { Palette } from 'react-leaflet-hotline';
import { LatLng as LatLngLeaflet } from 'leaflet';
import GradientLine from '../Components/Map/GradientLine';
import { DataPoint } from '../models/path';
import { getSurveyData } from '../queries/conditions';
import { getRoadsData } from '../queries/road';

// See in ../css/split.css
const halfSizeOfSplitBar = '5px';

const palette: Palette = [
  { t: 0, r: 0, g: 0, b: 255 },
  { t: 0.9, r: 0, g: 0, b: 255 },
  { t: 1, r: 240, g: 255, b: 0 },
];

/**
 * Handle the size change of the split components
 *
 * @param half1Threshold the threshold where the first half needs to collapse
 * @param half2Threshold the threshold where the second half needs to collapse
 * @param half1Callback the state setter for the first half's size
 * @param half2Callback the state setter for the second half's size
 *
 * @author Muro, Kerbourc'h
 */
const handlePanelSizeChange = (
  half1Threshold: number,
  half2Threshold: number,
  half1Callback: (size: number) => void,
  half2Callback: (size: number) => void,
) => {
  return (size: number) => {
    if (size <= half1Threshold) {
      half1Callback(0);
      half2Callback(100 - (10 / window.innerWidth) * 100);
    } else if (size >= half2Threshold) {
      half2Callback(0);
      half1Callback(100 - (10 / window.innerWidth) * 100);
    } else {
      half1Callback(size);
      half2Callback(100 - size - (10 / window.innerWidth) * 100);
    }
  };
};

/**
 * Inspect Page showing the map, road images and the chart graph with multiple Split components to resize them
 * @author Muro, Chen, Hansen, Kerbourc'h
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

  /** The type of the image to display */
  const [selectedType, setSelectedType] = useState<string>(ImageType.ImageInt);
  /** The available types of images */
  const [availableImagesTypes, setAvailableImagesTypes] = useState<string[]>(
    [],
  );

  /** The indicator type to display data on graph*/
  const [graphIndicatorType, setGraphIndicatorType] = useState<string[]>([
    'ALL',
  ]);

  /** The distances of the road displayed on the images */
  const [roadDistanceLeftToRight, setRoadDistanceLeftToRight] = useState<
    number[] | null
  >([0, 0]);

  /** The trigger and mapCenter to update and move the map */
  const [triggerUpdate, setTriggerUpdate] = useState<number>(0);
  /** The data for the gradient line */
  const [gradientLineData, setGradientLineData] = useState<{
    geometry: LatLngLeaflet[];
    data: DataPoint[];
  }>();
  /** The center of the map */
  const [mapCenter, setMapCenter] = useState<LatLng>();

  /** The data for the chart graph */
  const [chartData, setChartData] = useState<ConditionsGraphData[]>();
  /** The data to display */
  const [data, setData] = useState<Conditions[]>();
  /** Boolean to show loading circle */
  const [loading, setLoading] = useState<boolean>(true);

  const availableGraphIndicatorType = useMemo(() => {
    return Array.from(
      new Set(
        data
          ?.filter((item) => conditionTypes.includes(item.type))
          .map((item) => item.type),
      ),
    );
  }, [data]);

  useEffect(() => {
    if (id === undefined || type === undefined) return;
    setLoading(true);

    // The function called back when the data is fetched
    const dataCallback = (data: PathWithConditions) => {
      console.debug('Data received', data);

      //===== Update the gradient line data
      setGradientLineData({
        geometry: data.geometry.map(
          (item): LatLngLeaflet => new LatLngLeaflet(item[1], item[0]),
        ),
        data: [
          { value: 0, way_dist: 0 },
          { value: 0, way_dist: 1 },
        ],
      });
      setMapCenter({
        lat: data.geometry[Math.floor(data.geometry.length / 2)][1],
        lng: data.geometry[Math.floor(data.geometry.length / 2)][0],
      });
      //===== Update the chart data
      setData(data.data);
    };

    if (type === 'surveys') {
      getSurveyData(id, dataCallback);
    } else if (type === 'paths') {
      getRoadsData(id.split(','), dataCallback);
    }
    setLoading(false);
  }, [id, type]);

  useEffect(() => {
    if (data === undefined) return;
    setLoading(true);
    const conditionsGraphAllDataSets: ConditionsGraphData[] = [];

    const indicatorTypeToShow = graphIndicatorType.includes(conditionTypes[0])
      ? availableGraphIndicatorType
      : graphIndicatorType;

    for (let i = 0; i < indicatorTypeToShow.length; i++) {
      const rowOfData = data.filter(
        (item) => item.type === indicatorTypeToShow[i],
      );
      //check if rowOfData is empty
      if (rowOfData.length === 0) continue;
      const conditionsGraphSingleDataSet: ConditionsGraphData = {
        type: indicatorTypeToShow[i],
        dataValues: rowOfData.map((item) => ({
          x: item.distance,
          y: item.value,
        })),
        minY: Math.min(...rowOfData.map((item) => item.value)),
        maxY: Math.max(...rowOfData.map((item) => item.value)),
        minX: Math.min(...rowOfData.map((item) => item.distance)) - 1,
        maxX: Math.max(...rowOfData.map((item) => item.distance)) + 1,
      };
      conditionsGraphAllDataSets.push(conditionsGraphSingleDataSet);
    }
    setChartData(conditionsGraphAllDataSets);
    setLoading(false);
  }, [data, graphIndicatorType, availableGraphIndicatorType]);

  useEffect(() => {
    if (gradientLineData === undefined || roadDistanceLeftToRight === null)
      return;

    setLoading(true);

    setGradientLineData({
      geometry: gradientLineData.geometry,

      data:
        roadDistanceLeftToRight[0] === 0
          ? [
              { value: 1, way_dist: 0 },
              { value: 1, way_dist: roadDistanceLeftToRight[1] },
              { value: 0, way_dist: roadDistanceLeftToRight[1] + 0.01 },
            ]
          : [
              { value: 0, way_dist: roadDistanceLeftToRight[0] - 0.01 },
              { value: 1, way_dist: roadDistanceLeftToRight[0] },
              { value: 1, way_dist: roadDistanceLeftToRight[1] },
              { value: 0, way_dist: roadDistanceLeftToRight[1] + 0.01 },
            ],
    });
    setLoading(false);
  }, [roadDistanceLeftToRight]);

  return (
    <div className="inspect-page">
      <TopBar
        setSelectedType={setSelectedType}
        availableRoadImagesTypes={availableImagesTypes}
        graphIndicatorSet={(value: string[]) => {
          setGraphIndicatorType(
            value
              .map((e: any) => e.value)
              .toString()
              .split(','),
          );
        }}
        availableGraphIndicatorType={availableGraphIndicatorType}
        isLoading={loading}
      />
      <Split
        mode="vertical"
        className="split"
        onDragEnd={(sizeTop) => {
          handlePanelSizeChange(
            10,
            90,
            setTopPanelSize,
            setConditionsGraphSize,
          )(sizeTop);
          setTriggerUpdate((prev) => prev + 1);
        }}
      >
        <div
          style={{ height: `calc(${topPanelSize}% - ${halfSizeOfSplitBar})` }}
        >
          <Split
            mode="horizontal"
            onDragEnd={(sizeLeft) => {
              handlePanelSizeChange(
                7,
                93,
                setMapAreaSize,
                setRoadImageSize,
              )(sizeLeft);
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
                />
              </MapArea>
            </div>
            <div
              style={{
                width: `calc(${roadImageSize}% - ${halfSizeOfSplitBar})`,
              }}
            >
              <RoadImage
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
