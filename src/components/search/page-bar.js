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
import React from 'react';
import { Link } from 'react-router';

export default class SearchPageBar extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  handleFormSubmit = event => {
    event.preventDefault();
    this.button.context.router.push(
      this.submitQuery(this.props.location)
    );
  };

  // also fires just after location change
  submitQuery = location => {
    if (!this.searchBar) {
      return location;
    }

    const q = this.searchBar.value;
    const query = { ...location.query, q };
    return { ...location, query };
  };

  render() {
    return (
      <form className="layout list_item search__page-bar" onSubmit={this.handleFormSubmit}>
        <input
          className="input input-transparent search__page-input layout__grid_item layout__grid_item-fill layout__grid_item-wide"
          defaultValue={this.props.location.query.q}
          name="q"
          placeholder="Search"
          ref={c => this.searchBar = c}
          type="text"
        />
        <Link
          className="button button-light_blue search__button"
          ref={c => this.button = c}
          to={this.submitQuery}
        >
          Search
        </Link>
      </form>
    );
  }
}
