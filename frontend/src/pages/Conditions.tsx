import ConditionsMap from '../Components/Conditions/ConditionsMap';
import InfoButton from '../Components/Conditions/InfoButton';

const Conditions = () => {
  return (
    <div style={{ height: '95%' }}>
      <ConditionsMap>
        {/* we could place some other stuff in the bottom, if need should be */}
      </ConditionsMap>
      <InfoButton />
    </div>
  );
};

export default Conditions;
