import React from 'react';
import twtxt from 'twitter-text';


const Preview = (props) => {
  const text = props.post.text;
  const urls = twtxt.extractUrlsWithIndices(text);

  if (urls.length === 0) {
    return <script/>;
  }

  return <a className="embedly-card" data-card-width="100%" href={urls[0].url}></a>;
};

export default Preview;
