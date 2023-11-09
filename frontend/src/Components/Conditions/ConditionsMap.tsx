import React, { FC, useEffect, useRef, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { PathOptions } from 'leaflet';
import { FeatureCollection } from 'geojson';

import MapWrapper from '../Map/MapWrapper';
import {
  DateRange,
  DI,
  Enrg,
  IRI,
  IRInew,
  KPI,
  Mu,
  YearMonth,
  MultiMode,
  SeverityMode,
} from '../../models/conditions';
import { getAllConditions } from '../../queries/conditions';

const lessOrEqualThan = (
  yearMonth1: YearMonth,
  yearMonth2: YearMonth,
): boolean => {
  if (yearMonth1.year < yearMonth2.year) {
    return true;
  } else if (yearMonth1.year > yearMonth2.year) {
    return false;
  } else {
    return yearMonth1.month <= yearMonth2.month;
  }
};

const getTypeColor = (type: string): string => {
  switch (type) {
    case KPI:
      return 'red';
    case DI:
      return 'green';
    case IRI:
    case IRInew:
      return 'yellow';
    case Mu:
      return 'cyan';
    case Enrg:
      return 'magenta';
    default:
      return 'grey';
  }
};

/**
 * Return the color depending on the value
 * @param value the value
 * @param g the color is green if value <= g
 * @param gy otherwise the color is greenyellow if value <= gy
 * @param y otherwise the color is yellow if value <= y
 * @param o otherwise the color is orange if value <= o. Otherwise, the color is red
 * @returns {string} the color
 */
const getColorForValue = (
  value: number,
  g: number,
  gy: number,
  y: number,
  o: number,
  severity: string[],
): string => {
  for (let i = 0; i < severity.length; i++) {
    if (
      severity[i].includes('Critical') &&
      severity[i].includes('High') &&
      severity[i].includes('Medium') &&
      severity[i].includes('Low')
    ) {
      return value <= g
        ? '#09BD09' // green
        : value <= gy
        ? '#02FC02' // greenyellow
        : value <= y
        ? '#FFFF00' // yellow
        : value <= o
        ? '#ff9900' // orange
        : '#FF0000';
    } else if (
      severity[i].includes('Critical') &&
      severity[i].includes('High') &&
      severity[i].includes('Medium')
    ) {
      return value <= g
        ? '#FFFFFF' // transparent
        : value <= gy
        ? '#02FC02' // greenyellow
        : value <= y
        ? '#FFFF00' // yellow
        : value <= o
        ? '#ff9900' // orange
        : '#FF0000';
    } else if (
      severity[i].includes('Critical') &&
      severity[i].includes('High')
    ) {
      return value <= g
        ? '#FFFFFF' // transparent
        : value <= gy
        ? '#FFFFFF' // transparent
        : value <= y
        ? '#FFFF00' // yellow
        : value <= o
        ? '#ff9900' // orange
        : '#FF0000';
    } else if (severity[i].includes('Critical')) {
      return value <= g
        ? '#FFFFFF' // transparent
        : value <= gy
        ? '#FFFFFF' // transparent
        : value <= y
        ? '#FFFFFF' // yellow
        : value <= o
        ? '#ff9900' // orange
        : '#FF0000';
    }else{
      return value <= g
      ? '#FFFFFF' // transparent
      : value <= gy
      ? '#FFFFFF' // transparent
      : value <= y
      ? '#FFFFFF' // yellow
      : value <= o
      ? '#FFFFFF' // orange
      : '#FF0000';;
    }
  }
};

const getConditionColor = severity: string[], (properties: GeoJSON.GeoJsonProperties): string => {
  if (properties !== null) {
    const type = properties.type;
    const value = properties.value;

    if (type !== undefined && type !== 'ALL') {
      switch (type) {
        case KPI:
          return getColorForValue(value, 4.0, 6.0, 7.0, 8.0, severity);
        case DI:
          return getColorForValue(value, 1.2, 1.5, 2.0, 2.5);
        case IRI:
        case IRInew:
          return getColorForValue(value, 1.5, 1.5, 2.5, 2.5);
        case Mu:
          // The minus are a small trick to be able to use the getColorForValue
          return getColorForValue(-value, -0.8, -0.5, -0.3, -0.2);
        case Enrg:
          return getColorForValue(value, 0.05, 0.1, 0.15, 0.25);
      }
    }
  }
  return 'grey';
};

interface ConditionsMapProps {
  /** The children of the component **/
  children: React.ReactNode;
  /** The mode of the conditions to show (allows for multimodes)**/
  multiMode: MultiMode;
  /** The range of date to use to filter the conditions **/
  rangeSelected: DateRange;
  /** The severity selected to use to filter the conditions **/
  severitySelected: SeverityMode;
}

/**
 * Component rendering the map with the conditions
 */
const ConditionsMap: FC<ConditionsMapProps> = ({
  children,
  multiMode,
  rangeSelected,
  severitySelected,
}) => {
  const geoJsonRef = useRef<any>();
  // All the data, get from the backend
  const [dataAll, setDataAll] = useState<FeatureCollection>();
  // The date range across which the data is
  const [rangeAll, setRangeAll] = useState<DateRange>({});
  // The default data to show in the GeoJSON component
  const defaultData: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };

  useEffect(() => {
    // Load the conditions from the backend
    getAllConditions((data) => {
      const range: DateRange = {};
      data.features.forEach((f) => {
        if (f.properties !== null && f.properties.valid_time !== undefined) {
          const date = new Date(f.properties.valid_time);
          const yearMonth: YearMonth = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
          };
          f.properties.valid_yearmonth = yearMonth;
          if (range.start === undefined) {
            range.start = yearMonth;
          } else if (!lessOrEqualThan(range.start, yearMonth)) {
            range.start = yearMonth;
          }
          if (range.end === undefined) {
            range.end = yearMonth;
          } else if (!lessOrEqualThan(yearMonth, range.end)) {
            range.end = yearMonth;
          }
        }
      });
      setDataAll(data);
      setRangeAll(range);
    });
  }, []);

  // Update the data when parameters change
  useEffect(() => {
    if (dataAll === undefined || dataAll.features === undefined) return;
    if (geoJsonRef === undefined || geoJsonRef.current === undefined) return;

    const setConditions = (data: FeatureCollection) => {
      geoJsonRef.current.clearLayers();
      geoJsonRef.current.addData(data);
    };

    // Filters the data
    // Reformatted @author Hansen

    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: dataAll.features.filter((f) => {
        if (
          f.properties !== null &&
          (multiMode.ALL! || multiMode.mode!.includes(f.properties.type)) &&
          (f.properties.valid_yearmonth === undefined ||
            ((rangeSelected.start === undefined ||
              lessOrEqualThan(
                rangeSelected.start,
                f.properties.valid_yearmonth,
              )) &&
              (rangeSelected.end === undefined ||
                lessOrEqualThan(
                  f.properties.valid_yearmonth,
                  rangeSelected.end,
                ))))
        ) {
          return true;
        } else {
          return false;
        }
      }),
    };
    setConditions(featureCollection);
  }, [dataAll, multiMode, rangeAll, rangeSelected]);

  return (
    <MapWrapper>
      {children}
      {dataAll !== undefined && (
        <GeoJSON
          ref={geoJsonRef}
          data={defaultData}
          style={(
            feature:
              | GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
              | undefined,
          ): PathOptions => {
            // Set the style of the GeoJSON component (line color, opacity...)
            const mapStyle: PathOptions = {
              weight: 4,
              opacity: 1,
              color: 'grey',
            };

            if (
              feature !== undefined &&
              feature.properties !== null &&
              feature.properties.type !== undefined
            ) {
              // Color depending on the "mode"
              if (
                multiMode!.mode!.includes(feature.properties.type) &&
                !severitySelected.selected
              ) {
                mapStyle.color = getTypeColor(feature.properties.type);
                mapStyle.opacity = 0.5;
                switch (feature.properties.type) {
                  case KPI:
                    mapStyle.dashArray = '12 12';
                    break;
                  case DI:
                    mapStyle.dashArray = '20 20';
                    break;
                  case IRI:
                  case IRInew:
                    mapStyle.dashArray = '28 28';
                    break;
                  case Mu:
                    mapStyle.dashArray = '15 15';
                    break;
                  case Enrg:
                    mapStyle.dashArray = '22 22';
                }
              } else if (
                multiMode!.mode!.includes(feature.properties.type) &&
                multiMode!.count === 1 &&
                severitySelected.selected!
              ) {
                mapStyle.color = getConditionColor(feature.properties);
              } else if (multiMode!.count === 0) {
                mapStyle.color = getTypeColor('default'); // @author Hansen
              }
            }

            return mapStyle;
          }}
        />
      )}
    </MapWrapper>
  );
};

export default ConditionsMap;
