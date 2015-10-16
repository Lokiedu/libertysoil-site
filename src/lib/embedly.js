import React from 'react'
import request from 'superagent';
import _ from 'lodash';
import twtxt from 'twitter-text';


async function getPreviewsForUrls(urls) {
  let key = encodeURIComponent('5a4e2e9f83404c70a0fb2509ceef3f07');

  let result = {};

  for (let chunk of _.chunk(_.unique(urls), 10)) {
    let encodedUrls = chunk.map(encodeURIComponent);
    let embedlyUrl = `https://api.embed.ly/1/oembed?key=${key}&urls=${encodedUrls.join(',')}&luxe=1&format=json`;

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
          result[url] = `<a href="${url}" target="_blank">
              <img src="${frame.thumbnail_url}" width="${frame.thumbnail_width}" height="${frame.thumbnail_height}" />
            </a>`;
        } else {
          result[url] = false;
        }
      }
    } catch (e) {
      console.log(e);
      for (let url of chunk) {
        result[url] = false;
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
