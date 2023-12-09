import React, { FC, useCallback, useEffect, useRef } from 'react';
import { GeoJSON } from 'react-leaflet';
import L, { CircleMarkerOptions } from 'leaflet';
import { FeatureCollection } from 'geojson';

import MapWrapper from '../Map/MapWrapper';
import {
  DateRange,
  DI,
  Enrg,
  IRI,
  IRInew,
  KPI,
  lessOrEqualThan,
  Mu,
  MultiMode,
  SeverityMode,
} from '../../models/conditions';

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
 * Return the thresholds depending on condition type
 * @param type a string of condition type
 * @returns {number[]} the threshold constants for severity
 *
 * @author Hansen
 */
const getSeverityThresholds = (type: string): number[] => {
  let output: number[] = [];
  switch (type) {
    case KPI:
      output = [4.0, 6.0, 7.0, 8.0];
      break;
    case DI:
      output = [1.2, 1.5, 2.0, 2.5];
      break;
    case IRI:
    case IRInew:
      output = [1.5, 1.5, 2.5, 2.5];
      break;
    case Mu:
      output = [-0.8, -0.5, -0.3, -0.2];
      break;
    case Enrg:
      output = [0.05, 0.1, 0.15, 0.25];
      break;
  }
  return output;
};

/**
 * Return the color depending on the value
 * @param value the value
 * @param type a string of condition type
 * @returns {string} the color
 *
 * @author Kerbourc'h, Hansen
 */
const getColorForThreshold = (value: number, type: string): string => {
  const thresholds = getSeverityThresholds(type);

  if (value <= thresholds[0]) {
    return '#69B34C'; // Green
  } else if (value < thresholds[1]) {
    return '#ACB334'; // Yellow-ish Green
  } else if (thresholds[1] <= value && value <= thresholds[2]) {
    return '#FAB733'; // Yellow
  } else if (thresholds[2] < value && value <= thresholds[3]) {
    return '#FF8E15'; // Orange
  } else if (thresholds[3] < value) {
    return '#FF0D0D'; // Red
  } else {
    return '#00000000'; // Transparent
  }
};

/**
 * The gradient color for each indicator and its severity
 *
 * @param properties the type and value of the GeoJSON being drawn
 * @returns {string} the color to be drawn
 *
 * @author Kerbourc'h, Hansen
 */
const getSeverityColor = (properties: GeoJSON.GeoJsonProperties): string => {
  if (properties != null) {
    const type = properties.type;
    let value: number;

    if (type === 'Mu') {
      value = -properties.value;
    } else {
      value = properties.value;
    }
    if (type !== undefined) {
      return getColorForThreshold(value, type);
    }
  }
  return '#00000000';
};

/**
 * Checking if severity level matches value
 *
 * @param severity the selected severity level
 * @param properties the type and value of the GeoJSON being drawn
 * @returns {boolean} true if the value is within severity thresholds
 *
 * @author Hansen
 */

const severityThreshold = (
  severity: SeverityMode,
  properties: GeoJSON.GeoJsonProperties,
): boolean => {
  if (properties !== null) {
    const type = properties.type;
    let value: number = properties.value;
    let thresholds: number[] = [];

    if (type !== undefined && severity.mode !== undefined) {
      thresholds = getSeverityThresholds(type);

      if (type === 'Mu') {
        value = -value;
      }

      const isCritical = severity.mode.includes('Critical');
      const isHigh = severity.mode.includes('High');
      const isMedium = severity.mode.includes('Medium');
      const isLow = severity.mode.includes('Low');

      const meetsSeverityConditions =
        (isLow && (value <= thresholds[0] || value < thresholds[1])) ||
        (isMedium && thresholds[1] <= value && value <= thresholds[2]) ||
        (isHigh && thresholds[2] < value && value <= thresholds[3]) ||
        (isCritical && thresholds[3] < value);

      return meetsSeverityConditions;
    }
  }
  return false;
};

interface ConditionsMapProps {
  /** The children of the component **/
  children: React.ReactNode;
  /** The mode of the conditions to show (allows for multimodes)**/
  multiMode: MultiMode;
  /** The range of date to use to filter the conditions **/
  rangeSelected: DateRange;
  /** The mode of the conditions to show (allows for multimodes)**/
  severitySelected: SeverityMode;
  /** The data from the backend**/
  dataAll: FeatureCollection;
  /** The date range of the data**/
  rangeAll: DateRange;
}

/**
 * Component rendering the map with the conditions
 *
 * @author Hansen, Kerbourc'h
 */
const ConditionsMap: FC<ConditionsMapProps> = ({
  children,
  multiMode,
  rangeSelected,
  severitySelected,
  dataAll,
  rangeAll,
}) => {
  const geoJsonRef = useRef<any>();

  // The default data to show in the GeoJSON component
  const defaultData: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };

  const setStyle = useCallback(
    (
      feature:
        | GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
        | undefined,
    ): CircleMarkerOptions => {
      // Set the style of the GeoJSON component (line color, opacity...)
      const mapStyle: CircleMarkerOptions = {
        weight: 0,
        radius: 4,
        fillOpacity: 0.7,
        opacity: 0.7,
        color: 'grey',
      };
      if (
        feature !== undefined &&
        feature.properties !== null &&
        feature.properties.type !== undefined
      ) {
        if (
          multiMode.mode.includes(feature.properties.type) &&
          !severitySelected.selected
        ) {
          mapStyle.color = getTypeColor(feature.properties.type);
        } else if (multiMode.count === 0) {
          mapStyle.color = getTypeColor('default');
        } else if (severitySelected.selected) {
          mapStyle.color = getSeverityColor(feature.properties);
        }
      }
      mapStyle.fillColor = mapStyle.color;

      return mapStyle;
    },
    [multiMode, severitySelected],
  );

  // Update the data when parameters change
  useEffect(() => {
    if (dataAll === undefined || dataAll.features === undefined) return;
    if (geoJsonRef === undefined || geoJsonRef.current === undefined) return;

    const setConditions = (data: FeatureCollection) => {
      geoJsonRef.current.clearLayers();
      geoJsonRef.current.addData(data);
      geoJsonRef.current.setStyle(setStyle);
    };

    // Filters the data according to type, date range and severity type
    // @author Hansen, Kerbourc'h
    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: dataAll.features.filter((f) => {
        if (
          f.properties !== null &&
          (multiMode.ALL || multiMode.mode.includes(f.properties.type))
        ) {
          if (
            f.properties.valid_yearmonth === undefined ||
            ((rangeSelected.start === undefined ||
              lessOrEqualThan(
                rangeSelected.start,
                f.properties.valid_yearmonth,
              )) &&
              (rangeSelected.end === undefined ||
                lessOrEqualThan(
                  f.properties.valid_yearmonth,
                  rangeSelected.end,
                )))
          ) {
            if (severitySelected.selected) {
              return severityThreshold(severitySelected, f.properties);
            } else {
              return true;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      }),
    };
    setConditions(featureCollection);
  }, [dataAll, multiMode, rangeAll, rangeSelected, severitySelected]);

  return (
    <div style={{ height: 'calc(100% - var(--navbar-height))' }}>
      <MapWrapper>
        {children}
        {dataAll !== undefined && (
          <GeoJSON
            ref={geoJsonRef}
            data={defaultData}
            pointToLayer={(_feature, position) =>
              L.circleMarker(position, undefined)
            }
          />
        )}
      </MapWrapper>
    </div>
  );
};

export default ConditionsMap;
