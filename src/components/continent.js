import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import CONTINENTS from '../consts/continents';
import TagCloud from './tag-cloud';


const Continent = ({ code, count, geotags }) => {
  const imageUrl = `/images/geo/continents/${code}.svg`;
  const name = CONTINENTS[code].name;
  const url_name = CONTINENTS[code].url_name;

  return (
    <div
      className="layout__row continent"
      style={{
        backgroundImage: `url(${imageUrl})`,
        minHeight: '200px'
      }}
    >
      <Link className="continent__title" to={`/geo/${url_name}`}>
        {name} <span className="continent__amount">({count})</span>
      </Link>
      <div className="layout__row">
        <TagCloud geotags={geotags} showPostCount />
      </div>
    </div>
  );
};

Continent.propTypes = {
  code: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  geotags: PropTypes.arrayOf(PropTypes.shape({
    url_name: PropTypes.string
  })).isRequired
};

export default Continent;
