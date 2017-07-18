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
import omit from 'lodash/omit';

import MESSAGE_TYPES from '../../../consts/messageTypeConstants';
import Message from '../../message';

export default class RegisterFormV1Field extends React.PureComponent {
  static propTypes = {
    error: PropTypes.string,
    name: PropTypes.string,
    refFn: PropTypes.func,
    title: PropTypes.string,
    type: PropTypes.string,
    warn: PropTypes.string
  };

  static defaultProps = {
    type: 'text'
  };

  render() {
    const { error, name, warn } = this.props;

    return (
      <div className="layout__row layout__row-double">
        <label className="label label-before_input label-space" htmlFor={name}>
          {this.props.title}
        </label>
        <input
          className="input input-gray input-big input-block"
          id={name}
          name={name}
          ref={this.props.refFn}
          type={this.props.type}
          {...omit(this.props, KNOWN_PROPS)}
        />
        {error &&
          <Message message={error} type={MESSAGE_TYPES.ERROR} />
        }
        {warn &&
          <Message message={warn} type={MESSAGE_TYPES.INFO} />
        }
      </div>
    );
  }
}

const KNOWN_PROPS = Object.keys(RegisterFormV1Field.propTypes);
