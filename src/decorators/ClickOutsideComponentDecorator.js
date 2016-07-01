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
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

/**
* Decorator
* Call React component "onClickOutside" method on click outside DOM element event
* @param ComposedComponent
* @returns {*}
*/
const ClickOutsideComponentDecorator = (ComposedComponent) => {
  return class ClickOutsideComponentWrapper extends Component {
    handleClickOutside = (e) => {
      const component = this.root;
      const el = ReactDOM.findDOMNode(component);

      if (!el.contains(e.target)) {
        component.onClickOutside && component.onClickOutside(e);
      }
    };

    componentDidMount = () => {
      document.addEventListener('click', this.handleClickOutside);
    };

    componentWillUnmount = () => {
      document.removeEventListener('click', this.handleClickOutside);
    };

    render() {
      return <ComposedComponent ref={c => this.root = c} {...this.props} />;
    }
  };
};

export default ClickOutsideComponentDecorator;
