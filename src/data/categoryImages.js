// Local photos for the "Browse by Category" circles on Home (bundled in the app).
// Files: assets/categories/<category-slug>.jpg, square 512x512. Metro needs literal
// require() paths, so each one is listed by hand. A category with no entry here
// falls back to its drawn illustration automatically.
const CATEGORY_IMAGES = {
  'ghost-stories': require('../../assets/categories/ghost-stories.jpg'),
  'mythological-creatures': require('../../assets/categories/mythological-creatures.jpg'),
  'tribal-legends': require('../../assets/categories/tribal-legends.jpg'),
  'sacred-places': require('../../assets/categories/sacred-places.jpg'),
  'folk-tales': require('../../assets/categories/folk-tales.jpg'),
  'demigods-heroes': require('../../assets/categories/demigods-heroes.jpg'),
  'nature-spirits': require('../../assets/categories/nature-spirits.jpg'),
  'cursed-places': require('../../assets/categories/cursed-places.jpg'),
  'urban-legends': require('../../assets/categories/urban-legends.jpg'),
  'gods-goddesses': require('../../assets/categories/gods-goddesses.jpg'),
  'witches-sorcery': require('../../assets/categories/witches-sorcery.jpg'),
  'festivals-rituals': require('../../assets/categories/festivals-rituals.jpg'),
};

export default CATEGORY_IMAGES;
