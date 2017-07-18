import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CodeMirror from 'react-codemirror';

if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
  require('codemirror/mode/javascript/javascript');
  require('codemirror/lib/codemirror.css');
}

export default class JavascriptEditor extends Component {
  state = {
    code: ''
  };

  componentDidMount() {
    this.updateDefaultCode(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.updateDefaultCode(newProps);
  }

  updateDefaultCode(props) {
    if (!this.state.code || props.code !== this.state.code) {
      this.setState({ code: props.code });
    }
  }

  handleChange = (newCode) => {
    this.setState({ code: newCode });
  };

  render() {
    const options = {
      lineNumbers: true,
      readOnly: true,
    };

    return (
      <div>
        <div className="title">{this.props.file}</div>
        <CodeMirror
          value={this.props.code}
          onChange={this.handleChange}
          options={options}
        />
      </div>
    );
  }
}

JavascriptEditor.propTypes = {
  code: PropTypes.string.isRequired, //eslint-disable-line
  file: PropTypes.string.isRequired,
};
