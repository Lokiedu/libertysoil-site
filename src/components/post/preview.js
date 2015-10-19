import React from 'react';
import _ from 'lodash';

let Preview = (props) => {
  if (!('embedly' in props.post) || props.post.embedly === false) {
    return <script/>;
  }

  if (_.isString(props.post.embedly)) {
    let html = {__html: props.post.embedly};
    return (
      <div className="card__content" dangerouslySetInnerHTML={html}>
      </div>
    );
  }

  return (
    <div className="card__content">
      {props.post.embedly}
    </div>
  );
};

export default Preview;
