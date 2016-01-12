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
import _ from 'lodash';

import Autosuggest from './autosuggest';
import { API_HOST } from '../config';
import ApiClient from '../api/client';


export default class PickpointInput extends React.Component {
  static displayName = 'PickpointInput';

  static propTypes = {
    onSelect: PropTypes.func
  };

  static defaultProps = {
    onSelect: function () {}
  };

  state = {
    suggestions: [],
    value: ''
  };

  _getSuggestions = _.throttle(async ({ value }) => {
    let client = new ApiClient(API_HOST);

    let response = await client.pickpoint({
      q: value
    });

    if (!response.error) {
      this.setState({
        suggestions: response
      });
    }
  }, 300);

  _getSuggestionValue = (suggestion) => suggestion.display_name;

  _handleChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
  };

  _handleSelect = (event, { suggestion }) => {
    event.preventDefault();

    this.props.onSelect(suggestion);
  };

  render() {
    let inputProps = {
      className: 'input autosuggest__input',
      onChange: this._handleChange,
      placeholder: 'Start typing...',
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
      />
    );
  }
}
