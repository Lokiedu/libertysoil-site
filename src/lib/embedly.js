import React from 'react'
import request from 'superagent';
import _ from 'lodash';

export async function getOembed(urls) {
  let key = encodeURIComponent('5a4e2e9f83404c70a0fb2509ceef3f07');

  let result = {};

  for (let chunk of _.chunk(_.unique(urls), 10)) {
    let encodedUrls = chunk.map(encodeURIComponent);
    let embedlyUrl = `https://api.embed.ly/1/oembed?key=${key}&urls=${encodedUrls.join(',')}&luxe=1&format=json`;

    let req = request.get(embedlyUrl);
    let promise = Promise.resolve(req);

    let response = await promise;

    let idx = 0;
    for (let frame of response.body) {
      let url = chunk[idx++];

      if ('html' in frame) {
        result[url] = frame.html;
      } else if ('thumbnail' in frame) {
        result[url] = (
          <a href={url} target="_blank">
            <img src={frame.thumbnail} width={frame.thumbnail_width} height={frame.thumbnail_height} />
          </a>
        );
      } else {
        result[url] = false;
      }
    }
  }

  return result;
}
