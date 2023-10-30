// import React, { useState } from 'react';

// import Multiselect from 'multiselect-react-dropdown';

// // FIGURE THIS OUT

// interface Props {
//   /**
//    * value: text input in the search bar
//    * onPlaceSelect: function taking argument "value"
//    */

//   options: any[];
//   onOptionChange: (value: any) => void;
// }

// // options formatting:
// // options = [{key: "ALL", key: "KPI", .... }]

// /**
//  * Component rendering Search bar
//  */

// const MultiSelect: React.FC<Props> = ({ options, onOptionChange }) => {
//   const [selectedOptions, setOptions] = useState<String[]>([]);

//   function onChange(selectedList) {}

//   return (
//     <Multiselect
//       // Options to display in the dropdown
//       displayValue="key"
//       options={(options: string[]) => setOptions(options)}
//       onSelect={(onOptionChange, onChange)} // Function will trigger on select event
//       onRemove={onOptionChange} // Function will trigger on remove event
//       showCheckbox
//     />
//   );
// };

// export default MultiSelect;
export {};
