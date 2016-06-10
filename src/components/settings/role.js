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
import { uniqueId, assign } from 'lodash';

import { ROLES } from '../../consts/profileConstants';

export default class Role extends React.Component {
  static displayName = 'Role';

  static propTypes = {
    description: PropTypes.string,
    index: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      title: {},
      description: {}
    };
  }

  componentWillMount() {
    this.setState({
      title: { id: uniqueId() },
      description: { id: uniqueId() }
    });
  }

  changeHandler = (event) => {
    const { index, onChange } = this.props;
    const name = event.target.name;
    const value = event.target.value;

    const fieldOldData = this.state[name];
    const fieldNewData = assign({}, fieldOldData, { value });

    this.setState({ [name]: fieldNewData });
    onChange({ index, name, value });
  };

  removeHandler = () => {
    const { index, onRemove } = this.props;

    onRemove(index);
  };

  render() {
    const { title, description } = this.props;

    return (
      <div className="layout__row">
        <label className="layout__block layout__row layout__row-small" htmlFor={this.state.title.id}>Role</label>
        <div className="layout__row layout__row-small layout layout-align_vertical">
          <div className="layout__grid_item layout__grid_item-wide">
            <select
              className="input input-block input-select"
              defaultValue={title}
              id={this.state.title.id}
              name="title"
              onChange={this.changeHandler}
            >
              {ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="layout__grid_item layout">
            <div className="button action button-icon button-transparent" onClick={this.removeHandler}>
              <span className="micon micon-small button__icon">close</span>Remove role
            </div>
          </div>
        </div>
        <div className="layout__row">
          <label className="layout__block layout__row layout__row-small" htmlFor={this.state.description.id}>Description</label>
          <textarea
            className="layout__row layout__row-small input input-block input-textarea input-textarea_small"
            defaultValue={description}
            id={this.state.description.id}
            name="description"
            value={this.state.description.value}
            onChange={this.changeHandler}
          ></textarea>
        </div>
      </div>
    );
  }
}
