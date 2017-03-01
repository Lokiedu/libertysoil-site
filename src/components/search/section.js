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
import { findDOMNode } from 'react-dom';
import { Link } from 'react-router';
import { Map as ImmutableMap } from 'immutable';

import {
  SEARCH_RESULTS_PER_PAGE,
  SEARCH_SECTIONS_COUNTABILITY
} from '../../consts/search';
import { offsetTop } from '../../utils/browser';
import { convertModelsToTags } from '../../utils/tags';
import { PostBrief } from '../post';
import SearchItem from './item';
import SearchPaging from './paging';

export default class SearchSection extends React.Component {
  static defaultProps = {
    offset: 0
  };

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

  toShowMore = location => {
    let type;
    if (this.props.type === 'geotags') {
      type = 'locations';
    } else {
      type = this.props.type;
    }

    return {
      ...location,
      pathname: '/search/'.concat(type),
      query: {
        ...location.query,
        show: undefined
      }
    };
  }

  handlePageChange = () => {
    if (window && document) {
      const top = offsetTop(findDOMNode(this.body)) - 80;
      const windowTop = document.documentElement.scrollTop || document.body.scrollTop;
      if (windowTop > top) {
        window.scrollTo(0, top);
      }
    }
  };

  render() {
    const { count, items, offset, needPaging, type, ...props } = this.props;
    if (!items.size) {
      return null;
    }

    let itemsToRender;
    if (needPaging) {
      itemsToRender = items
        .slice(offset, offset + SEARCH_RESULTS_PER_PAGE);
    } else {
      itemsToRender = items
        .slice(offset, offset + SEARCH_RESULTS_PER_PAGE / 2);
    }

    const rendered = this.renderItems(type, itemsToRender, props);

    let description;
    if (count > 1) {
      description = `${count} ${SEARCH_SECTIONS_COUNTABILITY[type][1]} found:`;
    } else {
      description = `1 ${SEARCH_SECTIONS_COUNTABILITY[type][0]} found:`;
    }

    let paging;
    if (needPaging) {
      paging = (
        <SearchPaging
          limit={count}
          offset={offset}
          resultsPerPage={SEARCH_RESULTS_PER_PAGE}
          onPageChange={this.handlePageChange}
        />
      );
    } else if (count > SEARCH_RESULTS_PER_PAGE / 2) {
      paging = (
        <Link
          className="search__paging search__paging-item"
          onClick={this.props.onSectionPageOpen}
          to={this.toShowMore}
        >
          Show more
        </Link>
      );
    }

    return (
      <div className="search__section" ref={c => this.body = c}>
        <h3 className="search__title">{description}</h3>
        {rendered}
        {paging}
      </div>
    );
  }
}
