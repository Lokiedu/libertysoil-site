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
import omit from 'lodash/omit';

import { TAG_TYPES } from '../../../consts/tags';

import RawTag from '../raw';

const TAG_TYPES_TITLES = Object.keys(TAG_TYPES);

export default class BasicTag extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    icon: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape(),
    ]),
    name: PropTypes.shape({
      collapsed: PropTypes.bool,
      name: PropTypes.string,
      truncated: PropTypes.bool
    }),
    postCount: PropTypes.number,
    round: PropTypes.bool,
    showPostCount: PropTypes.bool,
    type: PropTypes.oneOf(TAG_TYPES_TITLES)
  };

  static defaultProps = {
    round: true
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  getClassName = () => {
    const { className, round, type } = this.props;

    let typeClassName;
    const typeConfig = TAG_TYPES[type];
    if (typeConfig) {
      typeClassName = typeConfig.className;
    }

    return classNames(
      className, typeClassName, 'tag',
      {
        'tag--round': round,
        'tag--collapsed': this.props.name.collapsed && !this.props.showPostCount
      }
    );
  };

  renderAside = () => {
    const { showPostCount } = this.props;
    if (!showPostCount) {
      return false;
    }

    const { postCount, round } = this.props;
    const className = classNames('tag__badge', {
      'tag--round': round
    });

    return (
      <div className={className}>
        {postCount}
      </div>
    );
  };

  renderIcon = () => {
    const { icon, type, round } = this.props;

    let typeIcon;
    const typeConfig = TAG_TYPES[type];
    if (typeConfig && typeConfig.icon) {
      typeIcon = typeConfig.icon;
    } else {
      typeIcon = {};
    }

    const iconConf = {
      ...omit(icon, ['collapsed']),
      className: classNames(
        icon.className,
        typeIcon.className,
        'tag__icon',
        {
          'icon--round': round,
          'tag__icon--collapsed': icon.collapsed
        }
      )
    };

    if (!iconConf.icon) {
      return {
        ...iconConf,
        icon: typeIcon.icon
      };
    }

    return iconConf;
  };

  renderName = () => {
    const { name } = this.props;
    return {
      ...name,
      className: classNames('tag__name', name.className)
    };
  };

  render() {
    const finalProps = omit(this.props,
      ['postCount', 'round', 'showPostCount', 'type']
    );

    return (
      <RawTag
        {...finalProps}
        aside={this.renderAside()}
        className={this.getClassName()}
        icon={this.renderIcon()}
        name={this.renderName()}
      />
    );
  }
}
