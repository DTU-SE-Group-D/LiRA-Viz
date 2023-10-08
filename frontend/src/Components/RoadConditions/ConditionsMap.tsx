import MapWrapper from '../Map/MapWrapper';
import { FC } from 'react';
import '../../css/road_conditions.css';

interface Props {}

const ConditionsMap: FC<Props> = () => {
  //TODO trigger redrwaw the plot

  return (
    <div className="road-conditions-map">
      <MapWrapper></MapWrapper>
    </div>
  );
};
export default ConditionsMap;
