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
import PropTypes from 'prop-types';

import React from 'react';
import { uniqueId, pick } from 'lodash';

import { Command } from '../../utils/command';
import { ROLES } from '../../consts/profileConstants';

import Role from './role';


export default class RolesManager extends React.Component {
  static displayName = 'RolesManager';

  static propTypes = {
    onChange: PropTypes.func,
    onError: PropTypes.func,
    onSave: PropTypes.func,
    roles: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string
      })
    )
  };

  static defaultProps = {
    onChange: () => {},
    onError: () => {},
    onSave: () => {},
    roles: []
  };

  constructor(props) {
    super(props);

    this.roles = [];
    this.state = {
      rolesAmount: 0
    };
  }

  componentWillMount() {
    this.roles = this.props.roles;
    this.roles.forEach(role => {
      role.id = uniqueId();
    });

    this.setState({ rolesAmount: this.roles.length });
  }

  dispatchChange = () => {
    const command = new Command('roles', this.handleSave);
    this.props.onChange(command);
  };

  handleSave = async () => {
    const roles = this.getRoles();
    let success = false;

    try {
      await this.props.onSave({ more: { roles } });
      success = true;
    } catch (e) {
      this.props.onError(e);
    }

    return { success };
  };

  getRoles = () => {
    const roles = this.roles.map(role =>
      pick(role, ['title', 'description'])
    );

    return roles;
  };

  onRemove = (index) => {
    this.roles.splice(index, 1);
    this.setState({ rolesAmount: this.state.rolesAmount - 1 });

    this.dispatchChange();
  };

  onChange = ({ index, name, value }) => {
    this.roles[index][name] = value;

    this.dispatchChange();
  };

  onAdd = () => {
    this.roles.push({
      title: ROLES[0],
      description: '',
      id: uniqueId()
    });
    this.setState({ rolesAmount: this.state.rolesAmount + 1 });

    this.dispatchChange();
  }

  render() {
    let roles;
    if (this.state.rolesAmount) {
      roles = this.roles.map((role, i) => (
        <Role
          description={role.description}
          index={i}
          key={role.id}
          title={role.title}
          onChange={this.onChange}
          onRemove={this.onRemove}
        />
      ));
    } else {
      roles = (
        <div className="layout__row">
          No roles...
        </div>
      );
    }

    return (
      <div>
        {roles}
        <div className="layout__row layout__row-double">
          <span className="button button-blue action" onClick={this.onAdd}>Add role</span>
        </div>
      </div>
    );
  }
}
