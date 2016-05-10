import { TAG_HASHTAG, TAG_LOCATION, TAG_SCHOOL } from '../consts/tags';


/**
 * Converts hashtags(labels), schools, and other tags to the same format.
 * { urlId, name, type }
 * @param {Object} params - {hashtags: [], schools: [], geotags: []}
 * @returns {Array}
 */
export function convertModelsToTags(params = {}) {
  const allTags = [];

  if (Array.isArray(params.geotags)) {
    params.geotags.forEach(function (tag) {
      allTags.push({
        urlId: tag.url_name,
        name: tag.name,
        type: TAG_LOCATION
      });
    });
  }

  if (Array.isArray(params.schools)) {
    params.schools.forEach(function (school) {
      allTags.push({
        urlId: school.url_name,
        name: school.name,
        type: TAG_SCHOOL
      });
    });
  }

  if (Array.isArray(params.hashtags)) {
    params.hashtags.forEach(function (tag) {
      allTags.push({
        urlId: tag.name,
        name: tag.name,
        type: TAG_HASHTAG
      });
    });
  }

  return allTags;
}
