import React from 'react';
import ReactAutosuggest from 'react-autosuggest';
import { omit } from 'lodash';


const theme = {
  container: 'autosuggest__container',
  containerOpen: 'autosuggest__container-open',
  input: 'autosuggest__input',
  suggestionsContainer: 'autosuggest__suggestions_container',
  suggestion: 'autosuggest__suggestion',
  suggestionFocused: 'autosuggest__suggestion-focused',
  sectionContainer: 'autosuggest__section_container',
  sectionTitle: 'autosuggest__section_title',
  sectionSuggestionsContainer: 'autosuggest__section_suggestions_container'
};

function Autosuggest(props) {
  const combinedTheme = Object.assign(theme, props.theme);
  props = omit(props, 'theme');

  return (
    <ReactAutosuggest theme={combinedTheme} {...props} />
  );
}

Autosuggest.propTypes = ReactAutosuggest.propTypes;

export default Autosuggest;
