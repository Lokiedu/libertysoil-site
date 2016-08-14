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

// v1
import Navigation from '../navigation';
import NavigationItem from '../navigation-item';
import Icon from '../icon';

class Bookmarks extends React.Component {
  static propTypes = {
    bookmarks: PropTypes.arrayOf(PropTypes.shape({}))
  };

  constructor(props) {
    super(props);

    this.state = {
      showSettings: false
    };
  }

  handleSettingsClick = (e) => {
    const { showSettings } = this.state;

    console.log(e);
    this.setState({ showSettings: !showSettings });
  };

  render() {
    const { bookmarks } = this.props;

    return (
      <Navigation>
        {bookmarks &&
          bookmarks.map((item, i) => (
            <NavigationItem
              key={i}
              to={item.url}
            >
              <div className="navigation-item__content">
                {item.title}
              </div>
              <div className="navigation-item__aside">
                <Icon
                  icon="settings"
                  onClick={this.handleSettingsClick}
                />
              </div>
              <div className="navigation-item__icon">
                <Icon
                  icon={item.icon}
                />
              </div>
            </NavigationItem>
          ))
        }
      </Navigation>
    );
  }
}
