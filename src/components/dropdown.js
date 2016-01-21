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
 import React, { Component } from 'react';

 import ClickOutsideComponentDecorator from '../decorators/ClickOutsideComponentDecorator';

 @ClickOutsideComponentDecorator
 class Dropdown extends Component {
   static displayName = 'Dropdown';

   constructor (props) {
     super(props);

     this.state = {
       isVisible: props.isVisible || false
     }
   }

   onClickOutside = () => {
     this.hide();
   };

   toggleVisibility = () => {
     this.setState({isVisible: !this.state.isVisible});
   };

   hide = () => {
     this.setState({isVisible: false});
   };

   render () {
     const {
       className,
       ...props
     } = this.props;
     const state = this.state;

     let dropdownClassName = `dropdown ${className}`;

     if (state.isVisible) {
       dropdownClassName = `${dropdownClassName} dropdown-open`;
     }

 return (
     <div className={dropdownClassName} {...props}>
       <div className="dropdown__trigger action" onClick={this.toggleVisibility}>
        <span className="micon micon-small">arrow_drop_down</span>
       </div>
       <div className="dropdown__body" onClick={this.toggleVisibility}>
        {props.children}
       </div>
     </div>
   )
  }
}

export default Dropdown;
