import urlAssembler from 'url-assembler';
import { API_URL, SITE_URL, API_URL_NAMES } from '../config.js';

const URLS = {
  API_URL_NAMES
};

function getSiteUrl (id, params) {
  return urlAssembler()
      .template(SITE_URL[id])
      .param(params)
      .toString();
}

function getApiUrl (id, params = {}) {
  return urlAssembler()
      .template(API_URL[id])
      .param(params)
      .toString();
}

export {
    URLS,
    getSiteUrl,
    getApiUrl
};
