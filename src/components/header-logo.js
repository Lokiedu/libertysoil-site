/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

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
import { Link } from 'react-router';
import { connect } from 'react-redux';

import createSelector from '../selectors/createSelector';

class HeaderLogo extends React.Component {
  static displayName = 'HeaderLogo';

  static propTypes = {
    isLink: PropTypes.bool,
    is_logged_in: PropTypes.bool.isRequired
  };

  static defaultProps = {
    isLink: true
  };

  constructor(...args) {
    super(...args);
    this.state = { src: '/images/logo.svg' };
  }

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  handleError = () => {
    this.setState({ src: '/images/mail/ls.png' });
  };

  render() {
    const iconBody = (
      <figure className="logo">
        <img
          alt="Liberty Soil"
          className="logo__image"
          src={this.state.src}
          onError={this.handleError}
        />
        <figcaption className="logo__title">Liberty Soil</figcaption>
      </figure>
    );

    let className = 'header__corner action';
    if (this.props.is_logged_in) {
      className += ' header__corner--colored';
    }

    if (this.props.isLink) {
      return (
        <Link to="/" className={className}>
          {iconBody}
        </Link>
      );
    }

    return (
      <div className={className}>{iconBody}</div>
    );
  }
}

const selector = createSelector(
  state => !!state.getIn(['current_user', 'id']),
  is_logged_in => ({ is_logged_in })
);

export default connect(selector)(HeaderLogo);
