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
import Autosuggest from 'react-autosuggest';

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

  async _getSuggestions(input, callback) {
    let client = new ApiClient(API_HOST);

    let response = await client.pickpoint({
      q: input
    });

    if (!response.error) {
      callback(null, response);
    } else {
      callback(new Error("Couldn't get locations"))
    }
  }

  _suggestionValue(suggestion) {
    return suggestion.display_name;
  }

  _suggestionRenderer(suggestion) {
    return suggestion.display_name;
  }

  render() {
    let inputAttributes = {
      className: 'input autosuggest__input',
      placeholder: 'Enter toponym'
    };

    let theme = {
      root: 'autosuggest',
      suggestions: 'autosuggest__suggestions',
      suggestion: 'autosuggest__suggestion',
      suggestionIsFocused: 'autosuggest__suggestion-focused',
      section: 'autosuggest__suggestions_section',
      sectionName: 'autosuggest__suggestions_section_name',
      sectionSuggestions: 'autosuggest__suggestions_section_suggestions'
    };

    return (
      <Autosuggest
        cache={false}
        inputAttributes={inputAttributes}
        onSuggestionSelected={this.props.onSelect}
        suggestionRenderer={this._suggestionRenderer}
        suggestionValue={this._suggestionValue}
        suggestions={_.debounce(this._getSuggestions, 300)}
        theme={theme}
      />
    );
  }
}
