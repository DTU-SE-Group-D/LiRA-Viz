import { useState } from 'react';

import '../css/road_details.css'; // Import the CSS file
import MapArea from '../Components/RoadDetails/MapArea';
import RoadImage from '../Components/RoadDetails/RoadImage';
import TopBar from '../Components/RoadDetails/TopBar';

const RoadDetails = () => {
  const [showMapImageMode, setShowRoadImageMode] = useState(false);

  return (
    <div>
      <TopBar isToggleOn={setShowRoadImageMode} />
      {showMapImageMode ? <RoadImage /> : <MapArea />}
      {/* TODO: putting plots here */}
      <div className="plot-area">{/* Content for the plot area */}</div>
    </div>
  );
};

export default RoadDetails;
