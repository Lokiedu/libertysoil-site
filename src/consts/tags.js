export const TAG_HASHTAG = 'TAG_HASHTAG';
export const TAG_SCHOOL = 'TAG_SCHOOL';
export const TAG_MENTION = 'TAG_MENTION';
export const TAG_LOCATION = 'TAG_LOCATION';
export const TAG_EVENT = 'TAG_EVENT';
export const TAG_PLANET = 'TAG_PLANET';
export const IMPLEMENTED_TAGS = [TAG_HASHTAG, TAG_LOCATION, TAG_SCHOOL];

export const SIZE = {
  NORMAL: 'NORMAL',
  BIG: 'BIG'
};

export const TAG_TYPES = {
  TAG_HASHTAG: {
    className: 'tag--hashtag',
    icon: { className: 'tag__icon--type_hashtag', icon: 'hashtag' },
    url: '/tag/'
  },
  TAG_LOCATION: {
    className: 'tag--geotag',
    icon: { className: 'tag__icon--type_geotag', icon: 'place' },
    url: '/geo/'
  },
  TAG_SCHOOL: {
    className: 'tag--school',
    icon: { className: 'tag__icon--type_school', icon: 'school' },
    url: '/s/'
  },
  TAG_EVENT: {
    className: 'tag--event',
    url: '/e/'
  },
  TAG_PLANET: {
    className: 'tag--planet',
    url: '/planet',
    isUrlFinal: true
  },
  TAG_MENTION: {
    className: 'tag--mention',
    url: '/@/'
  }
};

export const TAG_HEADER_SIZE = {
  MIN: {
    width: 700
  },
  NORMAL: {
    width: 1400
  },
  BIG: {
    width: 2800
  },
  PREVIEW: {
    width: 1400,
    height: 400
  }
};

export const DEFAULT_HEADER_PICTURE = '/images/hero/welcome.jpg';
