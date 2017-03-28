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
  constructor(props, ...args) {
    super(props, ...args);
    this.state = { q: props.location.query.q || '' };
  }

  componentWillReceiveProps(nextProps) {
    const nextQ = nextProps.location.query.q;
    if (nextQ !== this.props.location.query.q) {
      this.setState({ q: nextQ });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props
      || nextState.q !== this.state.q;
  }

  handleChange = (e) => {
    this.setState({ q: e.target.value });
  };

  handleFormSubmit = event => {
    event.preventDefault();
    this.button.context.router.push(
      this.submitQuery(this.props.location)
    );
  };

  // also fires just after location change
  submitQuery = location => {
    const q = this.state.q;
    if (!q) {
      return location;
    }

    const query = { ...location.query, q };
    return { ...location, query };
  };

  render() {
    return (
      <form className="layout list_item search__page-bar" onSubmit={this.handleFormSubmit}>
        <input
          className="input input-transparent search__page-input layout__grid_item layout__grid_item-fill layout__grid_item-wide"
          name="q"
          placeholder="Search"
          type="text"
          value={this.state.q}
          onChange={this.handleChange}
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
