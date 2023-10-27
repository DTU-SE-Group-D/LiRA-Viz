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
 */

const Search: React.FC<Props> = ({ onPlaceSelect }) => {
  function onSuggestionChange(value: any) {
    console.log(value);
  }

  // function preprocessHook(value: any) {
  //   return `${value}, Munich, Germany`;
  // }

  // function postprocessHook(feature: any) {
  //   return feature.properties.street;
  // }

  // function suggestionsFilter(suggestions: any) {
  //   const processedStreets: any[] = [];

  //   const filtered = suggestions.filter((value: any) => {
  //     if (
  //       !value.properties.street ||
  //       processedStreets.indexOf(value.properties.street) >= 0
  //     ) {
  //       return false;
  //     } else {
  //       processedStreets.push(value.properties.street);
  //       return true;
  //     }
  //   });

  //   return filtered;
  // }

  return (
    <GeoapifyContext apiKey="bb524d9939ae497688b9b2dddc5cf0a2">
      <GeoapifyGeocoderAutocomplete
        placeholder="Enter address here"
        // value={value}
        type={'street'}
        // lang={language}
        // position={position}
        // countryCodes={countryCodes}
        // limit={limit}
        filterByCountryCode={['dk', 'sa']}
        // filterByCircle={filterByCircle}
        // filterByRect={filterByRect}
        // filterByPlace={filterByPlace}
        // biasByCountryCode={biasByCountryCode}
        // biasByCircle={biasByCircle}
        // biasByRect={biasByRect}
        // biasByProximity={biasByProximity}
        placeSelect={onPlaceSelect}
        suggestionsChange={onSuggestionChange}
      />
    </GeoapifyContext>
  );
};

export default Search;
