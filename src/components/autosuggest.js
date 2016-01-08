import React from 'react';
import ReactAutosuggest from 'react-autosuggest';


const theme = {
  root: 'autosuggest',
  suggestions: 'autosuggest__suggestions',
  suggestion: 'autosuggest__suggestion',
  suggestionIsFocused: 'autosuggest__suggestion-focused',
  section: 'autosuggest__suggestions_section',
  sectionName: 'autosuggest__suggestions_section_name',
  sectionSuggestions: 'autosuggest__suggestions_section_suggestions'
};

export default function Autosuggest(props) {
  return (
    <ReactAutosuggest theme={theme} {...props} />
  );
}
