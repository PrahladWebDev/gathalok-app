// Local country photos for the Realms screen (bundled in the app, no internet needed).
// Files live in assets/realms/ as <country-name-lowercase-with-dashes>.jpg (800x600).
// Metro needs literal require() paths, so every image is listed here by hand.
// To add a missing one (e.g. Vietnam): drop vietnam.jpg in assets/realms/ and
// uncomment its line. Countries without an entry show a colour gradient instead.
const REALM_IMAGES = {
  'India': require('../../assets/realms/india.jpg'),
  'Nepal': require('../../assets/realms/nepal.jpg'),
  'Sri Lanka': require('../../assets/realms/sri-lanka.jpg'),
  'Bangladesh': require('../../assets/realms/bangladesh.jpg'),
  'Bhutan': require('../../assets/realms/bhutan.jpg'),
  'Pakistan': require('../../assets/realms/pakistan.jpg'),
  'China': require('../../assets/realms/china.jpg'),
  'Japan': require('../../assets/realms/japan.jpg'),
  'Thailand': require('../../assets/realms/thailand.jpg'),
  'Indonesia': require('../../assets/realms/indonesia.jpg'),
  'Vietnam': require('../../assets/realms/vietnam.jpg'), 
  'Cambodia': require('../../assets/realms/cambodia.jpg'),
  'Mexico': require('../../assets/realms/mexico.jpg'),
  'Egypt': require('../../assets/realms/egypt.jpg'),
  'Greece': require('../../assets/realms/greece.jpg'),
  'Ireland': require('../../assets/realms/ireland.jpg'),
  'United Kingdom': require('../../assets/realms/united-kingdom.jpg'),
  'Nigeria': require('../../assets/realms/nigeria.jpg'),
  'Brazil': require('../../assets/realms/brazil.jpg'),
  'United States': require('../../assets/realms/united-states.jpg'),
};

export default REALM_IMAGES;
