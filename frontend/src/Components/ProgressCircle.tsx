import { useState, useEffect, CSSProperties } from 'react';
import FadeLoader from 'react-spinners/FadeLoader';

import '../css/upload_panel.css';

const override: CSSProperties = {
  display: 'block',
  alignSelf: 'center',
  marginLeft: '48%',
  flex: 1,
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
      {loading && (
        <div className="upload-panel">
          <FadeLoader
            color="#0bc3ff"
            loading={loading}
            cssOverride={override}
            height={15}
            radius={2}
            speedMultiplier={2}
            width={8}
          />
        </div>
      )}
    </>
  );
};
export default ProgressCircle;
