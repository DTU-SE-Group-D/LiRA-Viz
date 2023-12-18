import React from 'react';

import {
  GeoapifyContext,
  GeoapifyGeocoderAutocomplete,
} from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import '../../../css/search.css';

interface Props {
  /**
   * value: text input in the search bar
   * onPlaceSelect: function taking argument "value"
   */
  onPlaceSelect: (value: any) => void;
}

/**
 * Component rendering Search bar
 *
 * @author Hansen
 */
const Search: React.FC<Props> = ({ onPlaceSelect }) => {
  return (
    <GeoapifyContext apiKey="278562afd6274f1484c58a79d37c76af">
      <GeoapifyGeocoderAutocomplete
        placeholder="Enter address here"
        type={'street'}
        filterByCountryCode={['dk', 'sa']} // Denmark and Saudi Arabia
        placeSelect={onPlaceSelect}
      />
    </GeoapifyContext>
  );
};

export default Search;
