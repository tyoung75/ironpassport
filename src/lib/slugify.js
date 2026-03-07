/**
 * Generate a URL-safe slug from gym name and city.
 * Pattern: {gym-name}-{city} → lowercase, alphanumeric + hyphens only.
 *
 * @param {string} name - Gym name
 * @param {string} city - City name
 * @returns {string} URL-safe slug
 */
export function generateGymSlug(name, city) {
  const raw = `${name} ${city}`;
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")   // remove non-alphanumeric
    .replace(/\s+/g, "-")           // spaces → hyphens
    .replace(/-+/g, "-")            // collapse hyphens
    .replace(/^-|-$/g, "");         // trim leading/trailing hyphens
}

/**
 * Generate a city slug from a city name.
 * @param {string} city
 * @returns {string}
 */
export function generateCitySlug(city) {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
