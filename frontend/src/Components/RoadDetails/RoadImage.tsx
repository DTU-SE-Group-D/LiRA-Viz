import React from 'react';

const maproadStyles = {
  margin: 0,
  padding: 20,
};

const road_area = <h1 style={maproadStyles}>Road surface image</h1>;

const RoadImage: React.FC = () => {
  return <div className="road-image">{road_area}</div>;
};

export default RoadImage;
