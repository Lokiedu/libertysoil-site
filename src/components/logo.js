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

import logo from '../images/logo.svg';
import lsImg from '../images/mail/ls.png';


export default class Logo extends React.Component {
  static displayName = 'Logo';

  static propTypes = {
    isLink: PropTypes.bool
  };

  static defaultProps = {
    isLink: true,
    height: '28',
    width: '28'
  };

  constructor(...args) {
    super(...args);
    this.state = { src: logo };
  }

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  handleError = () => {
    this.setState({ src: lsImg });
  };

  render() {
    const iconBody = (
      <figure className="logo">
        <img
          alt="Liberty Soil"
          className="logo__image"
          height={this.props.height}
          src={this.state.src}
          width={this.props.width}
          onError={this.handleError}
        />
        <figcaption className="logo__title">Liberty Soil</figcaption>
      </figure>
    );

    if (this.props.isLink) {
      return (
        <Link to="/" className={this.props.className}>
          {iconBody}
        </Link>
      );
    }

    return (
      <div className={this.props.className}>
        {iconBody}
      </div>
    );
  }
}
