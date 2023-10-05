import { ConditionType } from '../../models/graph';
import { ChartData } from 'chart.js';
import MapWrapper from '../Map/MapWrapper';
import Ways from './Ways';
import { FC, useCallback, useRef } from 'react';
import { getConditions } from '../../queries/conditions';
import { Condition } from '../../models/path';
import '../../css/road_conditions.css';

interface Props {
  type: ConditionType;
  setWayData: React.Dispatch<
    React.SetStateAction<ChartData<'scatter', number[], number> | undefined>
  >;
}

const ConditionsMap: FC<Props> = ({ type, setWayData }) => {
  const { name } = type;

  const ref = useRef(null);

  const onClick = useCallback((way_id: string, way_length: number) => {
    console.log('onclick called');

    getConditions(way_id, name, (wc: Condition[]) => {
      console.log('getConditions called');
      setWayData({
        labels: wc.map((p) => p.way_dist * way_length),
        datasets: [
          {
            //@ts-ignore
            type: 'line' as const,
            label: way_id,
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            data: wc.map((p) => p.value),
          },
        ],
      });
    });
  }, []);

  return (
    <div className="road-conditions-map" ref={ref}>
      <MapWrapper>
        <Ways type={name} onClick={onClick} />
      </MapWrapper>
    </div>
  );
};
export default ConditionsMap;
