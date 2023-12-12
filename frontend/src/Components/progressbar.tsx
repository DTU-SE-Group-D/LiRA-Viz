import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@nextui-org/react';

import '../css/progressbar.css';

interface ProgressBarProps {
  /** Boolean to show that the progress bar isLoading (if true) */
  isLoading: boolean;
}

/**
 * ProgressBar is a component that is a circle
 * that shows the progress of a task
 *
 * @author Hansen
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ isLoading }) => {
  const [loading, setLoading] = useState<boolean>(true);

  const [color, setColor] = useState<any>('primary');
  const [label, setLabel] = useState<any>('Loading...');
  const [value, setValue] = useState<number | undefined>(undefined);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (loading) {
      setColor('primary');
      setValue(undefined);
      setLabel('Loading...');
    } else {
      setColor('success');
      setValue(100);
      setLabel('Complete!');
    }
  }, [loading]);

  return (
    <>
      {/* <div className="progress-bar-container"> */}
      <CircularProgress
        color={color}
        size="lg"
        aria-label={label}
        value={value}
      ></CircularProgress>
      {/* </div> */}
    </>
  );
};
export default ProgressBar;
