import React from 'react';
import twtxt from 'twitter-text';


const Preview = ({ post }) => {
  const text = post.get('text') || post.getIn(['more', 'shortText']);
  const urls = twtxt.extractUrlsWithIndices(text);

  if (urls.length === 0) {
    return null;
  }

  return <a className="embedly-card" data-card-width="100%" href={urls[0].url} />;
};

export default Preview;
