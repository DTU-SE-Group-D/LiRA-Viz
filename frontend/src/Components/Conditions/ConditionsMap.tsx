import { useEffect, useRef, useState } from 'react';
import ReactSlider from 'react-slider';

import { GeoJSON, MapContainer, ScaleControl, TileLayer } from 'react-leaflet';
import { Layer, PathOptions } from 'leaflet';

import { Feature, FeatureCollection } from 'geojson';

import Zoom from '../Map/Zoom';
import { MAP_OPTIONS } from './constants';

import { getConditions } from '../../queries/fetchConditions';

import '../../css/slider.css';

const ALL = 'ALL';
const KPI = 'KPI';
const DI = 'DI';
const IRI = 'IRI';
const IRInew = 'IRI_new';
const Mu = 'Mu';
const Enrg = 'E_norm';

const conditionTypes = [
  ALL,
  KPI,
  DI,
  IRI, // IRInew,
  Mu,
  Enrg,
];

interface YearMonth {
  year: number;
  month: number;
}

interface DateRange {
  start?: YearMonth;
  end?: YearMonth;
}

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

const noMonth = (dateRange: DateRange): number => {
  if (dateRange.start === undefined || dateRange.end === undefined) {
    return NaN;
  } else {
    if (!lessOrEqualThan(dateRange.start, dateRange.end)) {
      return NaN;
    } else {
      return (
        (dateRange.end.year - dateRange.start.year) * 12 +
        dateRange.end.month -
        dateRange.start.month
      );
    }
  }
};

const noToYearMonth = (
  no: number,
  dateRange: DateRange,
): YearMonth | undefined => {
  if (dateRange.start !== undefined) {
    const month = dateRange.start.month + no;
    const normalizedMonth = ((month - 1) % 12) + 1;
    const years = Math.floor((month - 1) / 12);
    return { year: dateRange.start.year + years, month: normalizedMonth };
  }
  return undefined;
};

const yearMonthtoText = (yearMonth: YearMonth | undefined): string => {
  if (yearMonth === undefined) {
    return '??/??';
  }
  return (
    yearMonth.month.toString() + '/' + yearMonth.year.toString().substring(2)
  );
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
const green = '#09BD09'; //"#00FF00"
const greenyellow = '#02FC02'; // "#BFFF00"
const yellow = '#FFFF00';
const orange = '#FFBF00';
const red = '#FF0000';

const getConditionColor = (properties: GeoJSON.GeoJsonProperties): string => {
  if (properties !== null) {
    const type = properties.type;
    const value = properties.value;
    // const motorway = properties.motorway;

    if (type !== undefined && type !== 'ALL') {
      // if (motorway === undefined || !motorway) {
      // gradient for municpality roads
      switch (type) {
        case KPI:
          return value <= 4.0
            ? green
            : value <= 6.0
            ? greenyellow
            : value <= 7.0
            ? yellow
            : value <= 8.0
            ? orange
            : red;
        case DI:
          return value <= 1.2
            ? green
            : value <= 1.5
            ? greenyellow
            : value <= 2.0
            ? yellow
            : value <= 2.5
            ? orange
            : red;
        case IRI:
        case IRInew:
          return value <= 1.5 ? green : value <= 2.5 ? yellow : red;
        case Mu:
          return value >= 0.8
            ? green
            : value >= 0.5
            ? greenyellow
            : value >= 0.3
            ? yellow
            : value >= 0.2
            ? orange
            : red;
        case Enrg:
          return value <= 0.05
            ? green
            : value <= 0.1
            ? greenyellow
            : value <= 0.15
            ? yellow
            : value <= 0.25
            ? orange
            : red;
      }
      /* } else {
                // gradient for motorways
                switch (type) {
                    case KPI:
                        return value <= 2.0 ? green : (value <= 4.5 ? yellow : red)
                    case DI:
                        return value <= 1.0 ? green : (value <= 3.0 ? yellow : red)
                    case IRI:
                        return value <= 1.0 ? green : (value <= 2.0 ? yellow : red)
                }
            } */
    }
  }
  return 'grey';
};

const ConditionsMap = (props: any) => {
  const { children } = props;

  const { center, zoom, minZoom, maxZoom, scaleWidth } = MAP_OPTIONS;

  const geoJsonRef = useRef<any>();

  const [dataAll, setDataAll] = useState<FeatureCollection>();

  const [rangeAll, setRangeAll] = useState<DateRange>({});

  const [rangeSelected, setRangeSelected] = useState<DateRange>({});

  const [mode, setMode] = useState<string>('ALL');

  const inputChange = ({ target }: any) => {
    setMode(target.value);
  };

  const rangeChange = (values: number[]) => {
    if (values.length === 2) {
      const newSelectedRange: DateRange = {
        start: noToYearMonth(values[0], rangeAll),
        end: noToYearMonth(values[1], rangeAll),
      };
      setRangeSelected(newSelectedRange);
    }
  };

  useEffect(() => {
    getConditions((data) => {
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
      setRangeAll(range);
      setDataAll(data);
    });
  }, []);

  useEffect(() => {
    const setConditions = (data: FeatureCollection) => {
      if (geoJsonRef !== undefined && geoJsonRef.current !== undefined) {
        geoJsonRef.current.clearLayers();
        geoJsonRef.current.addData(data);
        geoJsonRef.current.setStyle(style);
      }
    };

    const style = (
      feature:
        | GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
        | undefined,
    ): PathOptions => {
      const mapStyle: PathOptions = {
        weight: 4,
        opacity: 1,
        color: 'grey',
        // fillcolor: 'red',
        // fillOpacity: 0.7
      };

      if (
        feature !== undefined &&
        feature.properties !== null &&
        feature.properties.type !== undefined
      ) {
        if (mode === 'ALL') {
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
        } else if (feature.properties.value !== undefined) {
          mapStyle.color = getConditionColor(feature.properties);
        }
      }

      return mapStyle;
    };

    if (mode === 'ALL') {
      if (dataAll !== undefined) {
        const featureCollection: FeatureCollection = {
          type: 'FeatureCollection',
          features:
            dataAll.features !== undefined
              ? dataAll.features.filter(
                  (f) =>
                    f.properties !== null &&
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
                          )))),
                )
              : [],
        };
        setConditions(featureCollection);
      }
    } else {
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features:
          dataAll !== undefined
            ? dataAll.features !== undefined
              ? dataAll.features.filter(
                  (f) =>
                    f.properties !== null &&
                    f.properties.type === mode &&
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
                          )))),
                )
              : []
            : [],
      };
      setConditions(featureCollection);
    }
  }, [dataAll, mode, rangeAll, rangeSelected]);

  const onEachFeature = (feature: Feature, layer: Layer) => {
    if (layer.on !== undefined) {
      layer.on({
        // mouseover: ... ,
        // mouseout: ... ,
        click: (e) => {
          console.log(e.target);
          console.log(feature);
        },
      });
    }
    if (
      feature !== undefined &&
      feature.properties !== null &&
      feature.properties.type !== undefined &&
      feature.properties.value !== undefined &&
      feature.properties.value !== null
    ) {
      layer.bindPopup(
        'Condition type: ' +
          feature.properties.type +
          '<br>' +
          'Value: ' +
          feature.properties.value.toPrecision(3) +
          '<br>' +
          (feature.properties.std !== undefined &&
          feature.properties.std !== null
            ? '&sigma;: ' + feature.properties.std.toPrecision(3) + '<br>'
            : '') +
          'Valid for ' +
          feature.properties.valid_time +
          '<br>' +
          'Computed on ' +
          feature.properties.compute_time +
          '<br>' +
          (feature.properties.motorway !== undefined &&
          feature.properties.motorway
            ? 'Motorway: yes <br>'
            : '') +
          'Trip (task id): ' +
          feature.properties.task_id +
          '<br>' +
          'Condition id: ' +
          feature.properties.id,
      );
    }
  };

  return (
    <div style={{ height: '100%' }}>
      <div style={{ height: '85%' }}>
        <MapContainer
          preferCanvas={true}
          center={center}
          zoom={zoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          scrollWheelZoom={true}
          zoomControl={false}
        >
          <TileLayer
            maxNativeZoom={maxZoom}
            maxZoom={maxZoom}
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {dataAll !== undefined && (
            <GeoJSON
              ref={geoJsonRef}
              data={dataAll}
              onEachFeature={onEachFeature}
            />
          )}

          <Zoom />
          <ScaleControl
            imperial={false}
            position="bottomright"
            maxWidth={scaleWidth}
          />
        </MapContainer>
        {children}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '200px auto' }}>
        <select
          className="sweetalert-input"
          defaultValue={mode}
          onChange={inputChange}
          style={{ width: '200px' }}
        >
          {conditionTypes.map((value) => (
            <option value={value} key={value}>
              {value}
            </option>
          ))}
        </select>

        {rangeAll !== undefined &&
          rangeAll.start !== undefined &&
          rangeAll.end !== undefined && (
            <ReactSlider
              className="horizontal-slider"
              thumbClassName="example-thumb"
              trackClassName="example-track"
              markClassName="example-mark"
              min={0}
              max={noMonth(rangeAll)}
              marks={true}
              renderMark={(props: any) => (
                <div {...props}>
                  {yearMonthtoText(noToYearMonth(props.key, rangeAll))}
                </div>
              )}
              defaultValue={[0, noMonth(rangeAll)]}
              ariaLabel={['Lower thumb', 'Upper thumb']}
              ariaValuetext={(state) =>
                `Thumb value ${yearMonthtoText(
                  noToYearMonth(state.valueNow, rangeAll),
                )}`
              }
              renderThumb={(props, state) => (
                <div {...props}>
                  {yearMonthtoText(noToYearMonth(state.valueNow, rangeAll))}
                </div>
              )}
              pearling
              minDistance={0}
              onChange={(value) => rangeChange(value)}
            />
          )}
      </div>
      {mode === 'ALL' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          Colors indicate condition types (not their values): &nbsp;{' '}
          <div style={{ color: getTypeColor(KPI) }}>KPI</div> &nbsp; &nbsp;
          <div style={{ color: getTypeColor(DI) }}>DI</div> &nbsp; &nbsp;
          <div style={{ color: getTypeColor(IRI) }}>IRI</div> &nbsp; &nbsp;
          <div style={{ color: getTypeColor(Mu) }}>&mu;</div> &nbsp; &nbsp;
          <div style={{ color: getTypeColor(Enrg) }}>E</div> &nbsp; &nbsp;
        </div>
      )}
      {mode !== 'ALL' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          Colors indicate condition values from &nbsp;
          <span style={{ color: green }}>green (good)</span>&nbsp;
          <span style={{ color: greenyellow }}>over</span>&nbsp;
          <span style={{ color: yellow }}>yellow (medium)</span>&nbsp;
          <span style={{ color: orange }}>to</span>&nbsp;
          <span style={{ color: red }}>red (bad)</span>!
        </div>
      )}
    </div>
  );
};

export default ConditionsMap;
