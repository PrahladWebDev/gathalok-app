// Ported 1:1 from the web app's assets/data/countries.js — lat/lng is used
// for the native map's markers instead of Leaflet's. `landmark` is the Wikipedia
// article title whose lead photo is used as the tile background on the Realms screen.
export const COUNTRIES = [
  { name: 'India',          code: 'IN', emoji: '🇮🇳', lat: 20.5937,  lng: 78.9629, landmark: 'Taj Mahal' },
  { name: 'Nepal',          code: 'NP', emoji: '🇳🇵', lat: 28.3949,  lng: 84.1240, landmark: 'Mount Everest' },
  { name: 'Sri Lanka',      code: 'LK', emoji: '🇱🇰', lat: 7.8731,   lng: 80.7718, landmark: 'Sigiriya' },
  { name: 'Bangladesh',     code: 'BD', emoji: '🇧🇩', lat: 23.6850,  lng: 90.3563, landmark: 'Sixty Dome Mosque' },
  { name: 'Bhutan',         code: 'BT', emoji: '🇧🇹', lat: 27.5142,  lng: 90.4336, landmark: 'Paro Taktsang' },
  { name: 'Pakistan',       code: 'PK', emoji: '🇵🇰', lat: 30.3753,  lng: 69.3451, landmark: 'Badshahi Mosque' },
  { name: 'China',          code: 'CN', emoji: '🇨🇳', lat: 35.8617,  lng: 104.1954, landmark: 'Great Wall of China' },
  { name: 'Japan',          code: 'JP', emoji: '🇯🇵', lat: 36.2048,  lng: 138.2529, landmark: 'Mount Fuji' },
  { name: 'Thailand',       code: 'TH', emoji: '🇹🇭', lat: 15.8700,  lng: 100.9925, landmark: 'Wat Arun' },
  { name: 'Indonesia',      code: 'ID', emoji: '🇮🇩', lat: -0.7893,  lng: 113.9213, landmark: 'Borobudur' },
  { name: 'Vietnam',        code: 'VN', emoji: '🇻🇳', lat: 14.0583,  lng: 108.2772, landmark: 'Hạ Long Bay' },
  { name: 'Cambodia',       code: 'KH', emoji: '🇰🇭', lat: 12.5657,  lng: 104.9910, landmark: 'Angkor Wat' },
  { name: 'Mexico',         code: 'MX', emoji: '🇲🇽', lat: 23.6345,  lng: -102.552, landmark: 'Chichen Itza' },
  { name: 'Egypt',          code: 'EG', emoji: '🇪🇬', lat: 26.8206,  lng: 30.8025, landmark: 'Great Pyramid of Giza' },
  { name: 'Greece',         code: 'GR', emoji: '🇬🇷', lat: 39.0742,  lng: 21.8243, landmark: 'Parthenon' },
  { name: 'Ireland',        code: 'IE', emoji: '🇮🇪', lat: 53.1424,  lng: -7.6921, landmark: 'Cliffs of Moher' },
  { name: 'United Kingdom', code: 'GB', emoji: '🇬🇧', lat: 55.3781,  lng: -3.4360, landmark: 'Stonehenge' },
  { name: 'Nigeria',        code: 'NG', emoji: '🇳🇬', lat: 9.0820,   lng: 8.6753, landmark: 'Zuma Rock' },
  { name: 'Brazil',         code: 'BR', emoji: '🇧🇷', lat: -14.2350, lng: -51.9253, landmark: 'Christ the Redeemer (statue)' },
  { name: 'United States',  code: 'US', emoji: '🇺🇸', lat: 37.0902,  lng: -95.7129, landmark: 'Statue of Liberty' },
];

export const COUNTRY_STORIES = {
  India:   { color: '#D4660A' },
  Mexico:  { color: '#1E8449' },
  Ireland: { color: '#117A65' },
  Japan:   { color: '#8B1A1A' },
  Egypt:   { color: '#B78C3E' },
  Greece:  { color: '#1A5276' },
};

export const getCountryColor = (countryName) => COUNTRY_STORIES[countryName]?.color || '#B78C3E';
export const getCountry = (name) => COUNTRIES.find((c) => c.name === name) || null;
