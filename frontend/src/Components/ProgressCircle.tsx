import { useState, useEffect, CSSProperties } from 'react';
import FadeLoader from 'react-spinners/FadeLoader';

const override: CSSProperties = {
  display: 'block',
  marginTop: 10,
};

interface ProgressCircleProps {
  /** Boolean to show the progress circle*/
  isLoading: boolean;
}

/**
 * ProgressCircle is a component that is a spinning dash-circle
 * that shows the progress of a task
 *
 * @author Hansen
 */
const ProgressCircle: React.FC<ProgressCircleProps> = ({ isLoading }) => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  return (
    <>
      {/* <div className="progress-bar-container"> */}
      <FadeLoader
        color="#1091ff"
        loading={loading}
        cssOverride={override}
        height={5}
        radius={1}
        speedMultiplier={2}
        width={10}
      />
      {/* </div> */}
    </>
  );
};
export default ProgressCircle;
