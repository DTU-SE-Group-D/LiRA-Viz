import { ChartData } from 'chart.js';

import ConditionsMap from '../Components/RoadConditions/ConditionsMap';
import ConditionsGraph from '../Components/RoadConditions/ConditionsGraph';

import { GraphProvider } from '../context/GraphContext';

import Split from 'react-split';

import '../css/split.css';
import '../css/road_conditions.css';
import { ConditionType } from '../models/graph';
import React, { useEffect, useState } from 'react';

//this is to visualise the Road Conditions (GP) map
const RoadConditions = () => {
  const [wayData, setWayData] = useState<ChartData<'line', number[], number>>();

  console.log(wayData);

  const type: ConditionType = {
    name: 'IRI',
    min: 0,
    max: 10,
    grid: true,
    samples: 40,
  };

  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isResizing) {
        const container = document.getElementById('container');
        const mouseY = event.clientY;
        if (container) {
          const topRect = container.getBoundingClientRect();
          const newTopHeight = mouseY - topRect.top;
          container.style.height = `${newTopHeight}px`;
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <GraphProvider>
      <Split
        className="split"
        direction="vertical"
        minSize={150}
        snapOffset={10}
      >
        <ConditionsMap type={type} setWayData={setWayData} />
      </div>
      <div
        className={`resizable-border ${isResizing ? 'resizing' : ''}`}
        onMouseDown={() => setIsResizing(true)}
      ></div>
      <div className="bottom" id="bottom-inside-container">
        {/*<ConditionsGraph type={type} data={wayData} />*/}
        <ConditionsGraph />
      </Split>
    </GraphProvider>
  );
};

export default RoadConditions;
