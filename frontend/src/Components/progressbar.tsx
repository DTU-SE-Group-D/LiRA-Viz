import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@nextui-org/react';

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
  const [loading, setLoading] = useState<boolean>(isLoading);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  if (loading) {
    return (
      <CircularProgress color="primary" size="lg" aria-label="Loading..." />
    );
  } else {
    return (
      <CircularProgress
        color="success"
        size="lg"
        aria-label="Complete"
        value={100}
      />
    );
  }
};
