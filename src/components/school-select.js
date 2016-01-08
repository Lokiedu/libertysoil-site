import React, { Component, PropTypes } from 'react';
import Autosuggest from './autosuggest';


// TODO: Get schools dynamically if there are too many schools.
export default class SchoolSelect extends Component {
  static displayName = 'SchoolSelect';
  static propTypes = {
    onSelect: () => {},
    schools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    }))
  };

  static defaultProps = {
    schools: []
  };

  _getSuggestions = (input, callback) => {
    let regex = new RegExp('^' + input, 'i');
    let suggestions = this.props.schools.filter(school => regex.test(school.name));

    callback(null, suggestions);
  };

  _getSuggestionValue = (school) => school.name;

  render() {
    let { onSelect, schools, ...restProps } = this.props;

    let inputAttributes = {
      className: 'input input-block input-transparent input-button_height autosuggest__input',
      name: 'school',
      placeholder: 'Start typing...'
    };

    return (
      <Autosuggest
        inputAttributes={inputAttributes}
        suggestionRenderer={this._getSuggestionValue}
        suggestionValue={this._getSuggestionValue}
        suggestions={this._getSuggestions}
        onSuggestionSelected={onSelect}
        {...restProps}
      />
    );
  }
}
