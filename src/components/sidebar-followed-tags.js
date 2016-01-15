import React, { PropTypes } from 'react';
import _ from 'lodash';

import SidebarFollowedTag from './sidebar-followed-tag';
import { convertModelsToTags } from '../utils/tags';


export default class SidebarFollowedTags extends React.Component {
  static displayName = 'SidebarFollowedTags';

  static propTypes = {
    geotags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      url_name: PropTypes.string
    })),
    schools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      url_name: PropTypes.string
    })),
    tags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    }))
  };

  _collectTags() {
    let tags = convertModelsToTags(this.props);

    return _.sortBy(tags, 'name');
  }

  _renderTags() {
    return this._collectTags().map(function (tag, index) {
      return <SidebarFollowedTag key={index} {...tag} />;
    });
  }

  render() {
    return (
      <div className="sidebar__followed_tags">
        {this._renderTags()}
      </div>
    );
  }
}
