import MapWrapper from '../Map/MapWrapper';
import { FC } from 'react';
import '../../css/road_conditions.css';
import ForceMapUpdate from '../Map/ForceMapUpdate';

interface Props {
  triggerUpdate: number;
}

const ConditionsMap: FC<Props> = ({ triggerUpdate }) => {
  //TODO trigger redrwaw the plot

  return (
    <div className="road-conditions-map">
      <MapWrapper>
        <ForceMapUpdate triggerUpdate={triggerUpdate} />
      </MapWrapper>
    </div>
  );
};
export default ConditionsMap;
