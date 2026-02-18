/**
 * Logique de filtrage combinée pour la section Chercher.
 * Applique Type, Catégorie(s), Localisation, Mot-clé en intersection.
 * Ne modifie pas les objets post ; compatible avec l'API existante.
 */

function normalize(str) {
  if (typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\u0300-\u036f/g, '')
    .trim();
}

function contains(haystack, needle) {
  if (!needle) return true;
  const n = normalize(needle);
  if (!n) return true;
  const h = normalize(String(haystack));
  return h.includes(n);
}

/**
 * Filtre les posts selon les critères de recherche (intersection).
 * @param {Array} posts - Liste des publications
 * @param {Object} filters - { typeRecherche, searchCategories, locationPlace, searchQuery }
 * @returns {Array} Posts filtrés
 */
export function applySearchFilters(posts, filters) {
  if (!Array.isArray(posts)) return [];
  const {
    typeRecherche = '',
    searchCategories = [],
    locationPlace = '',
    searchQuery = '',
  } = filters;

  const hasType = Boolean(typeRecherche && typeRecherche.trim());
  const hasCategories = Array.isArray(searchCategories) && searchCategories.length > 0;
  const hasLocation = Boolean(locationPlace && locationPlace.trim());
  const hasKeyword = Boolean(searchQuery && searchQuery.trim());

  if (!hasType && !hasCategories && !hasLocation && !hasKeyword) {
    return posts;
  }

  return posts.filter((post) => {
    if (hasType) {
      const postType = post.type || post.type_recherche || '';
      if (normalize(postType) !== normalize(typeRecherche)) return false;
    }
    if (hasCategories) {
      const postCat = post.category || post.categories;
      const postCats = Array.isArray(postCat) ? postCat : (postCat ? [postCat] : []);
      const matchCat = searchCategories.some(
        (c) => postCats.some((pc) => normalize(String(pc)) === normalize(String(c)))
      );
      if (!matchCat) return false;
    }
    if (hasLocation) {
      const locationFields = [
        post.location,
        post.city,
        post.ville,
        post.address,
        post.code_postal,
        post.adresse,
      ].filter(Boolean);
      const locationStr = locationFields.join(' ');
      if (!contains(locationStr, locationPlace)) return false;
    }
    if (hasKeyword) {
      const textFields = [
        post.text,
        post.description,
        post.title,
        post.association_name,
        post.name,
      ].filter(Boolean);
      const textStr = textFields.join(' ');
      if (!contains(textStr, searchQuery)) return false;
    }
    return true;
  });
}
