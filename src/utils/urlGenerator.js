import urlAssembler from 'url-assembler';
import { API_URL, URL, API_URL_NAMES, URL_NAMES } from '../config.js';

function getUrl (id, params) {
  return urlAssembler()
      .template(URL[id])
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
    API_URL_NAMES,
    URL_NAMES,
    getUrl,
    getApiUrl
};
