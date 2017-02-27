/*
 This file is a part of libertysoil.org website
 Copyright (C) 2016  Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import React from 'react';
import { Map as ImmutableMap } from 'immutable';

import { convertModelsToTags } from '../../utils/tags';
import { PostBrief } from '../post';
import SearchItem from './item';

export default class SearchSection extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  renderItems = (type, items, props = {}) => {
    switch (type) {
      case 'posts': {
        return items.map(post =>
          <PostBrief
            author={post.get('user')}
            className="search__result--type_post"
            key={post.get('id')}
            post={post}
            {...props}
          />
        );
      }
      case 'geotags':
      case 'hashtags':
      case 'schools': {
        const model = ImmutableMap({ [type]: items });
        return convertModelsToTags(model).map(tag =>
          <SearchItem key={type.concat(tag.urlId)} {...tag} {...props} />
        );
      }
      case 'people': {
        return items.map(user =>
          <SearchItem key={user.get('id')} type={type} user={user} {...props} />
        );
      }
      default: {
        return [];
      }
    }
  };

  render() {
    const { type, items, ...props } = this.props;
    const rendered = this.renderItems(type, items, props);

    const length = rendered.length || rendered.size;

    let description;
    if (length > 1) {
      description = `${length} ${type} found:`;
    } else {
      description = `1 ${type.slice(0, -1)} found:`;
    }

    return (
      <div className="search__section">
        <h3 className="search__title">{description}</h3>
        {rendered}
      </div>
    );
  }
}
