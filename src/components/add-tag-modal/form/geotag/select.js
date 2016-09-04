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
import { find, isEmpty, throttle } from 'lodash';

import { Autosuggest } from '../../deps';
import { ApiClient } from '../../deps';
import { API_HOST } from '../../deps';

export default class GeotagSelect extends Component {
  static displayName = 'GeotagSelect';

  static propTypes = {
    onSelect: PropTypes.func
  };

  static defaultProps = {
    onSelect: () => {}
  };

  constructor(props) {
    super(props);

    this.state = {
      geotagId: '', // Autosuggest doesn't support hidden values.
      suggestions: [],
      value: ''
    };
  }

  getValue() {
    return this.state.value;
  }

  getFirstOverlapModel() {
    return find(this.state.suggestions, s => s.name === this.state.value);
  }

  reset() {
    this.setState({
      geotagId: '',
      value: ''
    });
  }

  _getSuggestions = throttle(async ({ value }) => {
    if (!value.length) {
      return;
    }

    const client = new ApiClient(API_HOST);
    const response = await client.searchGeotags(value.trim());

    this.setState({ suggestions: response.geotags });
  }, 300);

  _getSuggestionValue = (geotag) => geotag.name;

  _renderSuggestion(geotag) {
    let name = geotag.name;
    const additionalInfo = [];

    if (!isEmpty(geotag.admin1)) {
      additionalInfo.push(geotag.admin1.name);
    }

    if (!isEmpty(geotag.country)) {
      additionalInfo.push(geotag.country.name);
    }

    if (additionalInfo.length > 0) {
      name += ` (${additionalInfo.join(', ')})`;
    }

    return name;
  }

  _handleSelect = (event, { suggestion }) => {
    event.preventDefault();

    this.props.onSelect(suggestion);

    this.setState({
      geotagId: suggestion.id
    });
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

    const theme = {
      suggestionsContainer: 'autosuggest__suggestions_container autosuggest__suggestions_container-with-scroll'
    };

    return (
      <div>
        <input name="geotag" type="hidden" value={this.state.geotagId} />
        <Autosuggest
          getSuggestionValue={this._getSuggestionValue}
          inputProps={inputProps}
          renderSuggestion={this._renderSuggestion}
          suggestions={this.state.suggestions}
          theme={theme}
          onSuggestionSelected={this._handleSelect}
          onSuggestionsUpdateRequested={this._getSuggestions}
          {...this.props}
        />
      </div>
    );
  }
}
