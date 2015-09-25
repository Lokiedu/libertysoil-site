export const API_HOST = 'http://localhost:8000';
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

export const SITE_URL = {
  HOME: '/',
  AUTH: '/auth',
  POST: '/post/:uuid'
};
