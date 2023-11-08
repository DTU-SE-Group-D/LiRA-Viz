import React from 'react';

import {
  GeoapifyGeocoderAutocomplete,
  GeoapifyContext,
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
  function onSuggestionChange(value: any) {
    console.log(value);
  }

  return (
    <GeoapifyContext apiKey="bb524d9939ae497688b9b2dddc5cf0a2">
      <GeoapifyGeocoderAutocomplete
        placeholder="Enter address here"
        type={'street'}
        filterByCountryCode={['dk', 'sa']} // Denmark and Saudi Arabia
        placeSelect={onPlaceSelect}
        suggestionsChange={onSuggestionChange}
      />
    </GeoapifyContext>
  );
};

export default Search;
