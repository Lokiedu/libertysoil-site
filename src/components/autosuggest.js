import React from 'react';
import ReactAutosuggest from 'react-autosuggest';


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

export default function Autosuggest(props) {
  return (
    <ReactAutosuggest theme={theme} {...props} />
  );
}
