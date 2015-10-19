import React from 'react';
import _ from 'lodash';
import twtxt from 'twitter-text';

let Preview = (props) => {
  let text = props.post.text;
  let urls = twtxt.extractUrlsWithIndices(text);

  if (urls.length === 0) {
    return <script/>;
  }

  return <a className="embedly-card" href={urls[0].url}></a>;
};

export default Preview;
