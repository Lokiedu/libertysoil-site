import React from 'react'
import request from 'superagent';
import _ from 'lodash';
import twtxt from 'twitter-text';

let cache = {};

async function getPreviewsForUrls(urls) {
  let key = encodeURIComponent('5a4e2e9f83404c70a0fb2509ceef3f07');

  let result = {};

  let cachedUrls = urls.filter(url => (url in cache));

  for (let url of cachedUrls) {
    result[url] = _.cloneDeep(cache[url]);
  }

  let uncachedUrls = urls.filter(url => !(url in cache));

  for (let chunk of _.chunk(_.unique(uncachedUrls), 10)) {
    let encodedUrls = chunk.map(encodeURIComponent);
    let embedlyUrl = `https://api.embed.ly/1/oembed?key=${key}&urls=${encodedUrls.join(',')}&luxe=1&width=800&format=json`;

    try {
      let req = request.get(embedlyUrl);
      let promise = Promise.resolve(req);

      let response = await promise;

      let idx = 0;
      for (let frame of response.body) {
        let url = chunk[idx++];

        if ('html' in frame) {
          result[url] = frame.html;
        } else if ('thumbnail_url' in frame) {
          let width = frame.thumbnail_width <= 800 ? frame.thumbnail_width : 800;
          result[url] = `<a href="${url}" target="_blank">
              <img src="${frame.thumbnail_url}" width="${width}" />
            </a>`;
        } else {
          result[url] = false;
        }

        cache[url] = _.cloneDeep(result[url]);
      }
    } catch (e) {
      for (let url of chunk) {
        result[url] = false;  // we do not cache this
      }
    }
  }

  return result;
}

async function getPreviewsForTexts(texts) {
  let firstUrls = texts.map(text => {
    let urls = twtxt.extractUrlsWithIndices(text);

    if (urls.length === 0) {
      return false;
    }

    return urls[0].url;
  });

  let previews = await getPreviewsForUrls(firstUrls.filter(Boolean));
  return firstUrls.map((url) => (url in previews) ? previews[url] : null);
}

export async function addPreviewsToPosts(posts) {
  let previews = await getPreviewsForTexts(posts.map(post => post.text));

  return posts.map((post, i) => {
    post['embedly'] = previews[i];
    return post;
  });
}

export async function addPreviewToPost(post) {
  post.embedly = (await getPreviewsForTexts([post.text]))[0];
  return post;
}
