// Slug Generation Service

import slugify from 'slugify';

/**
 * Generate URL-friendly slug from document title
 * @param {string} title - Document title
 * @returns {string} - URL-safe slug
 */
export const generateSlug = (title) => {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
};

/**
 * Generate unique slug by appending number if slug exists
 * @param {string} baseSlug - Base slug
 * @param {Function} checkExists - Async function to check if slug exists
 * @returns {Promise<string>} - Unique slug
 */
export const generateUniqueSlug = async (baseSlug, checkExists) => {
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
