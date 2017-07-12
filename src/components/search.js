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
import { Link, browserHistory } from 'react-router';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';

import { ArrayOfGeotags as ArrayOfGeotagsPropType } from '../prop-types/geotags';
import { ArrayOfHashtags as ArrayOfHashtagsPropType } from '../prop-types/hashtags';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { ActionsTrigger } from '../triggers';
import createSelector from '../selectors/createSelector';
import { searchObject } from '../store/search';

import { SEARCH_SECTIONS_COUNTABILITY } from '../consts/search';
import { TAG_HASHTAG, TAG_SCHOOL, TAG_LOCATION, TAG_PLANET } from '../consts/tags';
import { clearSearchResults } from '../actions/search';
import ClickOutsideComponentDecorator from '../decorators/ClickOutsideComponentDecorator';

import { OldIcon as Icon } from './icon';
import ListItem from './list-item';
import TagIcon from './tag-icon';

const CLOSE_ICON_SIZE = { inner: 'lm', outer: undefined };
const RESULT_ICON_SIZE = { inner: 'ms', outer: 's' };

function getResultsSectionTitle(sectionName, count) {
  let wordFormId;
  if (count === 1) {
    wordFormId = 0;
  } else {
    wordFormId = 1;
  }
  return `Show ${count} found ${SEARCH_SECTIONS_COUNTABILITY[sectionName][wordFormId]}`;
}

function requestSpace() {
  document.dispatchEvent(new CustomEvent('updateBreadcrumbs', {
    detail: {
      displayShortView: false,
      shouldDisplay: false
    }
  }));
}

function freeSpace() {
  document.dispatchEvent(new Event('updateBreadcrumbs'));
}

class Search extends Component {
  static displayName = 'Search';

  static propTypes = {
    clearSearchResults: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    results: PropTypes.shape({
      geotags: ArrayOfGeotagsPropType,
      hashtags: ArrayOfHashtagsPropType
    })
  };

  constructor(props) {
    super(props);

    this.state = {
      isOpened: false,
      loading: false,
      query: ''
    };

    const client = new ApiClient(API_HOST);
    this.triggers = new ActionsTrigger(client, props.dispatch);
    this.mobileMatched = true;
  }

  componentDidMount() {
    const binding = window.matchMedia('(max-width: 413px)');
    binding.addListener(this.handleMatchMobile);
    this.mobileMatched = binding.matches;
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props || !isEqual(nextState, this.state);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.isOpened !== this.state.isOpened) {
      this.manageSpace();
    }
  }

  componentWillUnmount() {
    window.matchMedia('(max-width: 413px)')
      .removeListener(this.handleMatchMobile);
  }

  manageSpace = () => {
    if (this.state.isOpened && this.mobileMatched) {
      requestSpace();
    } else {
      freeSpace();
    }
  };

  handleMatchMobile = (mobileQuery) => {
    this.mobileMatched = mobileQuery.matches;

    if (this.state.isOpened) {
      this.manageSpace();
    }
  };

  onClickOutside = () => {
    this.toggle(false);
  };

  callSearchAPI = debounce((query = '') => {
    const q = query.trim();

    if (q) {
      this.setState({ loading: true });

      this.triggers.search({ q }, { searchId: 'header' })
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

  onKeyDown = (e) => {
    if (e.keyCode === 13) {
      this.toggle(false);
      browserHistory.push({
        pathname: '/search',
        query: { q: this.state.query }
      });
    }
  };

  handleSectionLink = () => {
    this.toggle(false);
  }

  renderResults = () => {
    const { results } = this.props;
    const { isOpened, query } = this.state;

    if (!query || !isOpened || !results) {
      return false;
    }

    // if result isProcessing
    // ...

    const sections = [];
    for (const section of Object.keys(results)) {
      const count = results[section].count;
      if (count > 0) {
        sections.push({ type: section, count });
      }
    }

    if (!sections.length) {
      return false;
    }

    sections.push({ type: 'all' });

    return (
      <div className="search__result">
        {sections.map(section => {
          let icon, title, url;

          switch (section.type) {
            case 'locations': {
              icon = <TagIcon size={RESULT_ICON_SIZE} type={TAG_LOCATION} />;
              title = getResultsSectionTitle('locations', section.count);
              url = '/search/locations';
              break;
            }
            case 'hashtags': {
              icon = <TagIcon size={RESULT_ICON_SIZE} type={TAG_HASHTAG} />;
              title = getResultsSectionTitle('hashtags', section.count);
              url = '/search/hashtags';
              break;
            }
            case 'schools': {
              icon = <TagIcon size={RESULT_ICON_SIZE} type={TAG_SCHOOL} />;
              title = getResultsSectionTitle('schools', section.count);
              url = '/search/schools';
              break;
            }
            case 'posts': {
              icon = <TagIcon size={RESULT_ICON_SIZE} type={TAG_PLANET} />;  // FIXME: need a proper icon
              title = getResultsSectionTitle('posts', section.count);
              url = '/search/posts';
              break;
            }
            case 'people': {
              icon = <TagIcon size={RESULT_ICON_SIZE} type={TAG_PLANET} />;  // FIXME: need a proper icon
              title = getResultsSectionTitle('people', section.count);
              url = '/search/people';
              break;
            }
            case 'all': {
              title = 'Show all results';
              url = '/search';
              break;
            }
            default: {
              // eslint-disable-next-line no-console
              console.log(`Unhandled search result type: ${section.tagType}`);
              return null;
            }
          }

          return (
            <Link key={title} to={`${url}?q=${this.state.query}`} onClick={this.handleSectionLink}>
              <ListItem icon={icon}>
                {title}
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

    const classNameBlock = classNames(
      'search',
      this.props.className,
      { 'search-opened': isOpened }
    );

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
            onKeyDown={this.onKeyDown}
          />
          {!loading &&
            <Icon
              className={searchClearClass}
              icon="close"
              size={CLOSE_ICON_SIZE}
              onClick={this.clearQuery}
            />
          }
        </div>
        {loading &&
          <Icon
            className="search__icon"
            icon="refresh"
            size="block"
            spin
          />
        }
        {!loading &&
          <Icon
            className="search__icon"
            icon="search"
            size="block"
            onClick={this.actionClick}
          />
        }
        {this.renderResults()}
      </div>
    );
  }
}

const selector = createSelector(
  (state) => state.getIn(['search', 'header'], searchObject).get('results'),
  results => ({ results: results.toJS() })
);

const DecoratedSearch = ClickOutsideComponentDecorator(Search);
const ConnectedSearch = connect(selector, dispatch => ({
  dispatch,
  ...bindActionCreators({ clearSearchResults }, dispatch)
}))(DecoratedSearch);

export default ConnectedSearch;
