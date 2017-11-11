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

import { MediaTargets as ts } from '../../../../consts/media';
import { MediaTarget } from '../../../../prop-types/media';
import NavigationItem from '../../../navigation-item/link';

const getStats = (props) => props.stats;

function getTitle(props) {
  return props.title || props.titles[props.media] || props.titles['rest'];
}

function getText(props) {
  if (props.media === ts.xl) {
    const stats = getStats(props);
    if (stats) {
      return `${getTitle(props)}: ${stats}`;
    }
  }

  return getTitle(props);
}

export default class BaseMenuItem extends React.PureComponent {
  static displayName = 'BaseMenuItem';

  static propTypes = {
    media: MediaTarget,
    stats: PropTypes.string,
    title: PropTypes.string,
    titles: PropTypes.shape({
      xs: PropTypes.string,
      s: PropTypes.string,
      m: PropTypes.string,
      l: PropTypes.string,
      xl: PropTypes.string,
      rest: PropTypes.string
    }),
    visible: PropTypes.bool
  };

  static defaultProps = {
    visible: true
  };

  static propKeys = Object.keys(BaseMenuItem.propTypes);

  constructor(props, context) {
    super(props, context);
    this.restProps = omit(props, BaseMenuItem.propKeys);
  }

  componentWillReceiveProps(nextProps) {
    this.restProps = omit(nextProps, BaseMenuItem.propKeys);
  }

  render() {
    if (!this.props.visible) {
      return false;
    }

    return (
      <NavigationItem
        theme="2.0"
        {...this.restProps}
      >
        {getText(this.props)}
      </NavigationItem>
    );
  }
}
