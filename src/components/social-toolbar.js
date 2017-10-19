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
import React  from 'react';
import Link from 'react-router/lib/Link';
import { List } from 'immutable';

import { OldIcon as Icon } from './icon';

export default class SocialToolbar extends React.Component {
  static displayName = 'SocialToolbar';

  static defaultProps = {
    entries: List()
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const { defaultClassName, entries } = this.props;
    if (!entries.size) {
      return null;
    }

    return (
      <div className="layout layout__row">
        {entries.map((service, i) => {
          const { className = defaultClassName, to, ...rest } = service;

          if (to) {
            if (to.match(/^(\/\/)|(https?:\/\/)/)) {
              return (
                <a className={className} href={to}>
                  <Icon key={i} pack="fa" {...rest} />
                </a>
              );
            }

            return (
              <Link className={className} to={to}>
                <Icon key={i} pack="fa" {...rest} />
              </Link>
            );
          }
          return <Icon className={className} key={i} pack="fa" {...rest} />;
        })}
      </div>
    );
  }
}
