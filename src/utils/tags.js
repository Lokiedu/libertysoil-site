export const TAG_HASHTAG = 'TAG_HASHTAG';
export const TAG_SCHOOL = 'TAG_SCHOOL';
export const TAG_MENTION = 'TAG_MENTION';
export const TAG_LOCATION = 'TAG_LOCATION';
export const TAG_EVENT = 'TAG_EVENT';

/**
 * Converts hashtags(labels), schools, and other tags to the same format.
 * { urlId, name, type }
 * @param {Object} params - {tags: [], schools: []}
 * @returns {Array}
 */
export function convertModeldsToTags(params) {
  let allTags = [];

  params.schools.forEach(function (school) {
    allTags.push({
      urlId: school.url_name,
      name: school.name,
      type: TAG_SCHOOL
    });
  });

  params.tags.forEach(function (tag) {
    allTags.push({
      urlId: tag.name,
      name: tag.name,
      type: TAG_HASHTAG
    });
  });

  return allTags;
}
