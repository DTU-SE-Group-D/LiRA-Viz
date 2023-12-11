/**
 * Prints the boolean values from the available array, with descriptions of what each boolean means. This function is used as the debug feature in the function whats_available. It can also be used after the whats_available function on its own.
 * @param {string} file path to xml file.
 * @param available the available array
 * @author Vejlgaard
 */
export function print_whats_available(file: string, available: boolean[]) {
  if (file != null) {
    console.log('File name and path for function whats_available');
    console.log('File name: ' + file);
    console.log('-----------------------------------');
  }
  console.log('---------- start of list ----------');
  console.log('Crack module available: ' + available[0]);
  console.log('Rutting module available: ' + available[1]);
  console.log('Macro texture module available: ' + available[2]);
  console.log('Lane marking module available: ' + available[3]);
  console.log('Rumble strip detection module available: ' + available[4]);
  console.log('Potholes module available: ' + available[5]);
  console.log('Drop-off and curb module available: ' + available[6]);
  console.log('Joint module for concrete pavement available: ' + available[7]);
  console.log('Raveling module available: ' + available[8]);
  console.log('Roughness module available: ' + available[9]);
  console.log(
    'Road geometry (slope and cross-slope) module available: ' + available[10],
  );
  console.log('Water entrapment calculation available: ' + available[11]);
  console.log('Shoving calculation available: ' + available[12]);
  console.log('Pick-out detection module available: ' + available[13]);
  console.log('Bleeding module available: ' + available[14]);
  console.log('Sealed crack module available: ' + available[15]);
  console.log(
    'Manholes(man-made object-mmo) module available: ' + available[16],
  );
  console.log('Patch detection module available: ' + available[17]);
  console.log('Pumping detection module available: ' + available[18]);
  console.log('----------- end of list -----------');
  console.log('-----------------------------------');
}
