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
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { removeMessage } from '../../actions/messages';
import { toggleMenu } from '../../actions/ui';
import createSelector from '../../selectors/createSelector';

import { OldIcon as Icon } from '../icon';
import TopMessageSwitch from './switch';

export const ICON_SIZE = { inner: 'm', outer: 'l' };

class TopMenu extends React.Component {
  static displayName = 'TopMenu';
  static propTypes = {
    onHomeClick: PropTypes.func
  };
  static defaultProps = {
    onHomeClick: () => {}
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const { message } = this.props;

    let body;
    if (message) {
      body = <TopMessageSwitch {...this.props} />;
    } else {
      body = (
        <div className="top-menu layout layout-align_justify">
          <Icon
            className="action top-menu__icon"
            icon="home"
            pack="fa"
            size={ICON_SIZE}
            onClick={this.props.onHomeClick}
          />
        </div>
      );
    }

    return (
      <div>{body}</div>
    );
  }
}

const ACCEPTED_MESSAGES = [
  'welcome-guest',
  'welcome-user',
  'welcome-first-login'
];

const mapStateToProps = createSelector(
  state => state
    .get('messages')
    .entrySeq()
    .filter(entry => ACCEPTED_MESSAGES.includes(entry[1].get('message')))
    .first(),
  message => ({ message })
);

const mapDispatchToProps = dispatch => ({
  dispatch,
  onHomeClick: () => dispatch(toggleMenu(true))
});

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps,
  onMessageClose: () => stateProps.message && dispatchProps.dispatch(removeMessage(stateProps.message[0]))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(TopMenu);
