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
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { debounce, take } from 'lodash';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { ActionsTrigger } from '../triggers';
import createSelector from '../selectors/createSelector';

import { TAG_HASHTAG, TAG_SCHOOL, TAG_LOCATION, TAG_PLANET } from '../consts/tags';
import { clearSearchResults } from '../actions';

import Icon from './icon';
import ListItem from './list-item';
import TagIcon from './tag-icon';
import bem from '../utils/bemClassNames';
import ClickOutsideComponentDecorator from '../decorators/ClickOutsideComponentDecorator';

@ClickOutsideComponentDecorator
class Search extends Component {
  static displayName = 'Search';

  static propTypes = {
    clearSearchResults: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    results: PropTypes.shape({
      geotags: PropTypes.arrayOf(PropTypes.shape({})),
      hashtags: PropTypes.arrayOf(PropTypes.shape({}))
    })
  };

  constructor(props) {
    super(props);

    this.state = {
      isOpened: false,
      loading: false,
      query: ''
    };
  }

  onClickOutside = () => {
    this.toggle(false);
  };

  callSearchAPI = debounce((query) => {
    let searchQuery = query;

    if (searchQuery) {
      searchQuery = searchQuery.trim();
    }

    if (searchQuery) {
      this.setState({ loading: true });

      const client = new ApiClient(API_HOST);
      const triggers = new ActionsTrigger(client, this.props.dispatch);

      triggers.search(query)
        .then(() => {
          this.setState({ loading: false });
        })
        .catch(() => {
          this.setState({ loading: false });
        });
    }
  }, 1000);

  toggle = (mode) => {
    let newStateValue = !this.state.isOpened;

    if (mode != null) {
      newStateValue = mode;
    }

    this.setState({
      isOpened: newStateValue
    }, () => {
      if (newStateValue) {
        this.queryField.focus();
      }
    });
  };

  updateQuery = (e) => {
    const query = e.target.value;
    this.setState({ query });

    if (query) {
      this.callSearchAPI(query);
    } else {
      this.props.clearSearchResults();
    }
  };

  clearQuery = (e) => {
    e.stopPropagation();

    this.setState({ query: '' });
    this.props.clearSearchResults();

    this.queryField.focus();
  };

  actionClick = () => {
    const {
      query,
      isOpened
    } = this.state;

    if (isOpened && query) {
      this.callSearchAPI(query);
    } else {
      this.toggle();
    }
  };

  renderResults = () => {
    const { results } = this.props;
    const { isOpened, query } = this.state;

    if (!query || !isOpened || !results) {
      return false;
    }

    // if result isProcessing
    // ...

    let tags = [];
    for (const section of Object.keys(results)) {
      tags = tags.concat(
        results[section].map(tag =>
          ({ tagType: section, ...tag })
        )
      );
    }

    tags = take(tags, 10);

    return (
      <div className="search__result">
        {tags.map((tag, i) => {
          let icon, name, url;

          switch (tag.tagType) {
            case 'geotags': {
              icon = <TagIcon big type={TAG_LOCATION} />;
              name = tag.name;
              url = `/geo/${tag.url_name}`;
              break;
            }
            case 'hashtags': {
              icon = <TagIcon big type={TAG_HASHTAG} />;
              name = tag.name;
              url = `/tag/${tag.name}`;
              break;
            }
            case 'schools': {
              icon = <TagIcon big type={TAG_SCHOOL} />;
              name = tag.name;
              url = `/s/${tag.url_name}`;
              break;
            }
            case 'posts': {
              icon = <TagIcon big type={TAG_PLANET} />;  // FIXME: need a proper icon
              name = tag.more.pageTitle;
              url = `/post/${tag.id}`;
              break;
            }
            default:
              console.log(`Unhandled search result type: ${tag.tagType}`);  // eslint-disable-line no-console
              return <noscript/>;
          }

          return (
            <Link key={i} to={url}>
              <ListItem icon={icon}>
                {name}
              </ListItem>
            </Link>
          );
        })}
      </div>
    );
  };

  render() {
    const {
      query,
      isOpened,
      loading
    } = this.state;

    let classNameBlock = bem.makeClassName({
      block: 'search',
      modifiers: {
        opened: isOpened
      }
    });

    let searchClearClass = 'search__clear';
    if (!query) {
      searchClearClass = `${searchClearClass} invisible`;
    }

    return (
      <div className={classNameBlock}>
        <div className="search__body">
          <input
            className="search__input"
            key="queryField"
            ref={c => this.queryField = c}
            type="text"
            value={query}
            onChange={this.updateQuery}
            onClick={this.actionClick}
          />
          {!loading &&
            <Icon
              className={searchClearClass}
              icon="close"
              onClick={this.clearQuery}
            />
          }
        </div>
        {loading &&
          <Icon
            className="search__icon"
            icon="refresh"
            spin
          />
        }
        {!loading &&
          <Icon
            className="search__icon"
            icon="search"
            onClick={this.actionClick}
          />
        }
        {this.renderResults()}
      </div>
    );
  }
}

const selector = createSelector(
  state => state.get('search'),
  search => ({
    results: search.get('results').toJS()
  })
);

export default connect(selector, dispatch => ({
  dispatch,
  ...bindActionCreators({ clearSearchResults }, dispatch)
}))(Search);
