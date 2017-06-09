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
import React, { Children, isValidElement, cloneElement } from 'react';
import noop from 'lodash/noop';

import Dropdown, { defaultIcon } from './v2';

function getSelected(_value, _defaultValue, renderSelected) {
  const selected = [];

  let value;
  if (!_value) {
    value = _defaultValue;
  } else {
    value = _value;
  }

  const c = renderSelected(value);
  if (isValidElement(c)) {
    selected.push(cloneElement(c, { key: 'value' }));
  } else {
    selected.push(c);
  }

  selected.push(defaultIcon);
  return selected;
}

export default class DropdownAsSelect extends React.Component {
  static displayName = 'DropdownAsSelect';

  static defaultProps = {
    onChange: noop,
    renderSelected: c => c
  };

  constructor(props, ...args) {
    super(props, ...args);
    this.selected = getSelected(
      props.value,
      props.defaultValue,
      props.renderSelected
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.selected = getSelected(
        nextProps.value,
        nextProps.defaultValue,
        nextProps.renderSelected
      );
    }
  }

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  handleClick = (e) => {
    const nextValue = e.target.value;
    if (nextValue !== this.props.value) {
      this.props.onChange(e);
    }
  };

  render() {
    const { value } = this.props;

    return (
      <Dropdown
        className={this.props.className}
        disabled={this.props.disabled}
        icon={this.selected}
        theme={this.props.theme}
      >
        {Children.map(this.props.children, c => {
          if (!isValidElement(c)) {
            return c;
          }

          return cloneElement(c, {
            active: c.props.value === value,
            onClick: this.handleClick
          });
        })}
      </Dropdown>
    );
  }
}
