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
import React, { Component, PropTypes } from 'react';
import { throttle } from 'lodash';

import { Autosuggest, ApiClient, API_HOST } from '../../deps';

export default class HashtagSelect extends Component {
  static displayName = 'HashtagSelect';

  static propTypes = {
    onSelect: PropTypes.func
  };

  static defaultProps = {
    onSelect: () => {
    }
  };

  constructor(props) {
    super(props);

    this.state = {
      suggestions: [],
      value: ''
    };
  }

  get value() {
    return this.state.value;
  }

  reset() {
    this.setState({
      value: ''
    });
  }

  _getSuggestions = throttle(async ({ value }) => {
    if (value.length < 2) {
      return;
    }

    const client = new ApiClient(API_HOST);
    const response = await client.searchHashtags(value.trim());

    this.setState({ suggestions: response.hashtags.slice(0, 5) });
  }, 300);

  _getSuggestionValue = (tag) => tag.name;

  _handleSelect = (event, { suggestion }) => {
    event.preventDefault();

    this.props.onSelect(suggestion);
  };

  _handleChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
  };

  render() {
    const inputProps = {
      className: 'input input-block input-transparent input-button_height autosuggest__input',
      placeholder: 'Start typing...',
      onChange: this._handleChange,
      value: this.state.value
    };

    return (
      <Autosuggest
        getSuggestionValue={this._getSuggestionValue}
        inputProps={inputProps}
        renderSuggestion={this._getSuggestionValue}
        suggestions={this.state.suggestions}
        onSuggestionSelected={this._handleSelect}
        onSuggestionsUpdateRequested={this._getSuggestions}
        {...this.props}
      />
    );
  }
}
