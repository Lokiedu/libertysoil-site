/**
 * Originally taken from https://github.com/facebook/react/blob/master/docs/_js/live_editor.js
 * Formatted and adopted to use at LibertySoil's UI Kit.
 **/
import React from 'react';

let CodeMirror;
const IS_MOBILE = (
  typeof navigator !== 'undefined' &&
  (navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i))
);
const codeMirrorEditorStyle = { overflow: 'scroll' };

export default class CodeMirrorEditor extends React.Component {
  static propTypes = {
    lineNumbers: React.PropTypes.bool,
    mode: React.PropTypes.string,
    onChange: React.PropTypes.func
  };

  static defaultProps = {
    lineNumbers: false,
    mode: 'jsx'
  };

  componentDidMount() {
    if (IS_MOBILE) {
      return;
    }

    CodeMirror = require('codemirror');
    require('codemirror/mode/jsx/jsx');
    require('codemirror/mode/css/css');
    require('codemirror/theme/base16-light.css');
    this.editor = CodeMirror.fromTextArea(this.textArea, {
      mode: this.props.mode,
      lineNumbers: this.props.lineNumbers,
      lineWrapping: true,
      smartIndent: false,  // javascript mode does bad things with jsx indents
      matchBrackets: true,
      viewportMargin: Infinity,
      theme: 'base16-light',
      readOnly: this.props.readOnly,
    });
    this.editor.on('change', this.handleChange);
  }

  componentDidUpdate() {
    if (this.props.readOnly) {
      this.editor.setValue(this.props.codeText);
    }
  }

  handleChange = () => {
    if (!this.props.readOnly) {
      this.props.onChange && this.props.onChange(this.editor.getValue());
    }
  };

  render() {
    let editor;
    if (IS_MOBILE) {
      editor = (
        <pre style={codeMirrorEditorStyle}>
          {this.props.codeText}
        </pre>
      );
    } else {
      editor = (
        <textarea
          defaultValue={this.props.codeText}
          ref={c => this.textArea = c}
        />
      );
    }

    // wrap in a div to fully contain CodeMirror
    return (
      <div className="ui-kit__editor" style={this.props.style}>
        {editor}
      </div>
    );
  }
}
