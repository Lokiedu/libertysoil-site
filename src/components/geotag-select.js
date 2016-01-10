import React, { Component, PropTypes } from 'react';

import Autosuggest from './autosuggest';
import ApiClient from '../api/client';
import { API_HOST } from '../config';

export default class GeotagSelect extends Component {
  static displayName = 'GeotagSelect';

  static propTypes = {
    onSelect: PropTypes.func
  };

  static defaultProps = {
    schools: [],
    onSelect: () => {}
  };

  // Autosuggest doesn't support hidden values.
  state = {
    value: ''
  };

  _getSuggestions = async (input, callback) => {
    let client = new ApiClient(API_HOST);
    let response = await client.searchGeotags(input);

    callback(null, response.geotags);
  };

  _getSuggestionValue = (geotag) => geotag.name;

  _handleSelect = (suggestion) => {
    this.props.onSelect(suggestion, event);

    this.setState({
      value: suggestion.id
    });
  };

  render() {
    let { onSelect, ...restProps } = this.props;

    let inputAttributes = {
      className: 'input input-block input-transparent input-button_height autosuggest__input',
      placeholder: 'Start typing...'
    };

    return (
      <div>
        <input type="hidden" name="geotag" value={this.state.value} />
        <Autosuggest
          inputAttributes={inputAttributes}
          suggestionRenderer={this._getSuggestionValue}
          suggestionValue={this._getSuggestionValue}
          suggestions={this._getSuggestions}
          onSuggestionSelected={this._handleSelect}
          {...restProps}
        />
      </div>
    );
  }
}
