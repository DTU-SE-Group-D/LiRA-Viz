// A test for the map matching algorithm that will be removed
import { FC, useEffect, useState } from 'react';
import { Circle, Polyline } from 'react-leaflet';
import MapWrapper from '../Components/Map/MapWrapper';
import { LatLngLiteral } from 'leaflet';

const Test: FC = () => {
  const [originalData, setOriginalData] = useState<LatLngLiteral[][]>([]);
  const [mapMatchedData, setMapMatchedData] = useState<LatLngLiteral[][]>([]);

  useEffect(() => {
    fetch('http://localhost:3002/map_matching/database').then(async (resp) => {
      const json = await resp.json();
      console.debug(json);
      // let me savedz
      setOriginalData(
        json.map((survey: any) => {
          console.log(survey.measurements.length);
          return survey.measurements.map((measurement: any) => ({
            lat: measurement.coordinate.lat,
            lng: measurement.coordinate.lon,
          }));
        }),
      );

      setMapMatchedData(
        json.map((data: any) => {
          return data.ways.map((point: any) => {
            return point.coordinates;
          });
        }),
      );
    });
  }, []);

  return (
    <MapWrapper>
      {originalData.map((data, i) => (
        <div key={i}>
          <Polyline pathOptions={{ weight: 2 }} positions={data} />
          {data.map((mark, index) => (
            <Circle
              key={index}
              center={[mark.lat, mark.lng]}
              radius={1}
              color={'grey'}
            />
          ))}
        </div>
      ))}
      {mapMatchedData.map((data, i) => (
        <Polyline
          key={i}
          pathOptions={{ weight: 2, color: 'green' }}
          positions={data}
        />
      ))}
    </MapWrapper>
  );
};

export default Test;
