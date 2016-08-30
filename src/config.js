// Put here things you want to send to a client.

export const API_HOST = process.env.API_HOST ? process.env.API_HOST : 'http://localhost:8000';
export const API_URL_PREFIX = `${API_HOST}/api/v1`;

export const API_URL_NAMES = {
  USERS: `USERS`,
  SESSION: `SESSION`,
  POSTS: `POSTS`,
  FOLLOW: `FOLLOW`
};

export const API_URL = {
  [API_URL_NAMES.USERS]: `${API_URL_PREFIX}/users`,
  [API_URL_NAMES.SESSION]: `${API_URL_PREFIX}/session`,
  [API_URL_NAMES.POSTS]: `${API_URL_PREFIX}/posts`,
  [API_URL_NAMES.FOLLOW]: `${API_URL_PREFIX}/follow`
};

export const URL_NAMES = {
  HOME: `HOME`,
  AUTH: `AUTH`,
  POST: `POST`,
  USER: `USER`,
  SETTINGS: `SETTINGS`,
  EMAIL_SETTINGS: `EMAIL_SETTINGS`,
  MANAGE_FOLLOWERS: `MANAGE_FOLLOWERS`,
  CHANGE_PASSWORD: `CHANGE_PASSWORD`,
  EDIT_POST: `EDIT_POST`,
  SCHOOL: 'SCHOOL',
  HASHTAG: 'HASHTAG',
  GEOTAG: 'GEOTAG'
};

export const URL = {
  [URL_NAMES.HOME]: '/',
  [URL_NAMES.AUTH]: '/auth',
  [URL_NAMES.POST]: '/post/:uuid',
  [URL_NAMES.EDIT_POST]: '/post/edit/:uuid',
  [URL_NAMES.USER]: '/user/:username',
  [URL_NAMES.SETTINGS]: '/settings',
  [URL_NAMES.EMAIL_SETTINGS]: '/settings/email',
  [URL_NAMES.MANAGE_FOLLOWERS]: '/settings/followers',
  [URL_NAMES.CHANGE_PASSWORD]: '/settings/password',
  [URL_NAMES.SCHOOL]: '/s/:url_name',
  [URL_NAMES.HASHTAG]: '/tag/:name',
  [URL_NAMES.GEOTAG]: '/geo/:url_name'
};

export const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
