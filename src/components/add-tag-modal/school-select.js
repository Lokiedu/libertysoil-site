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
import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

import Autosuggest from './../autosuggest';


export default class SchoolSelect extends Component {
  static displayName = 'SchoolSelect';

  static propTypes = {
    onSelect: PropTypes.func,
    schools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    }))
  };

  static defaultProps = {
    schools: [],
    onSelect: () => {}
  };

  state = {
    suggestions: [],
    value: ''
  };

  reset() {
    this.setState({
      value: ''
    });
  }

  getValue() {
    return this.state.value;
  }

  getFirstOverlapModel() {
    return _.find(this.state.suggestions, s => s.name === this.state.value);
  }

  _getSuggestions = ({ value }) => {
    let regex = new RegExp('^' + value.trim(), 'i');
    let suggestions = this.props.schools.filter(school => regex.test(school.name)).slice(0, 5);

    this.setState({suggestions});
  };

  _handleChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
  };

  _getSuggestionValue = (school) => school.name;

  _handleSelect = (event, { suggestion }) => {
    event.preventDefault();

    this.props.onSelect(suggestion);
  };

  render() {
    let { onSelect, schools, ...restProps } = this.props;

    let inputProps = {
      className: 'input input-block input-transparent input-button_height autosuggest__input',
      name: 'school',
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
        {...restProps}
      />
    );
  }
}
