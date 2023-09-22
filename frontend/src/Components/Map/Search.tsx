// Copied from README... in progress!!

import React, { useState } from 'react';

import {
  GeoapifyGeocoderAutocomplete,
  GeoapifyContext,
} from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import '../../css/search.css';

//import fetch from 'node-fetch'; // npm install node-fetch
// v

// const response = await fetch(https://api.geoapify.com/v1/geocode/autocomplete?text=YOUR_TEXT&format=json&apiKey=YOUR_API_KEY);
// const data = await response.json();

// console.log(data);

const Search: React.FC = () => {
  function onPlaceSelect(value: any) {
    console.log(value);
  }

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
        // type={type}
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
