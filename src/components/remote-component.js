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
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

import createSelector from '../selectors/createSelector';

export class RemoteComponent extends React.Component {
  static propTypes = {
    args: PropTypes.shape(),
    className: PropTypes.string,
    component: PropTypes.func,
    isVisible: PropTypes.bool
  };

  static defaultProps = {
    args: {},
    component: () => false,
    isVisible: false
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const { isVisible, args, className } = this.props;

    const cn = classNames(className, {
      'hidden': !isVisible
    });

    let isVisibleProp;
    if (typeof this.props.component.propTypes === 'object') {
      if ('isVisible' in this.props.component.propTypes) {
        isVisibleProp = isVisible;
      }
    }

    return (
      <div className={cn}>
        <this.props.component isVisible={isVisibleProp} {...args} />
      </div>
    );
  }
}

const inputSelector = createSelector(
  state => state.get('remote'),
  remote => ({
    args: remote.get('args'),
    component: remote.get('component'),
    isVisible: remote.get('isVisible')
  })
);

const outputSelector = dispatch => ({
  dispatch
});

export default connect(inputSelector, outputSelector)(RemoteComponent);
