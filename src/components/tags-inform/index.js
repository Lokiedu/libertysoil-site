/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import createSelector from '../../selectors/createSelector';

import AllTagsInform from './all';
import FollowedTagsInform from './followed';

/**
 * Navigation-like block displaying number of unread posts
 * per each group of tags (geotags, schools, hashtags)
 */
class TagsInform extends React.PureComponent {
  static propTypes = {
    is_logged_in: PropTypes.bool
  };

  static USED_PROPS = ['is_logged_in'];

  static defaultProps = {
    theme: 'normal'
  };

  constructor(props, context) {
    super(props, context);
    this.innerProps = omit(props, TagsInform.USED_PROPS);
  }

  componentWillReceiveProps(nextProps) {
    this.innerProps = omit(nextProps, TagsInform.USED_PROPS);
  }

  render() {
    if (this.props.is_logged_in) {
      return (
        <FollowedTagsInform {...this.innerProps} />
      );
    }

    return (
      <AllTagsInform {...this.innerProps} />
    );
  }
}

const mapStateToProps = createSelector(
  state => !!state.getIn(['current_user', 'id']),
  is_logged_in => ({ is_logged_in })
);

export default connect(mapStateToProps)(TagsInform);
