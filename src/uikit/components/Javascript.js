import PropTypes from 'prop-types';
import React, { Component } from 'react';

const isBrowser =
     typeof window !== 'undefined'
  && typeof window.navigator !== 'undefined';

let CodeMirror;
if (isBrowser) {
  CodeMirror = require('react-codemirror2');
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
        {isBrowser &&
          <CodeMirror
            value={this.props.code}
            onChange={this.handleChange}
            options={options}
          />
        }
      </div>
    );
  }
}

JavascriptEditor.propTypes = {
  code: PropTypes.string.isRequired, //eslint-disable-line
  file: PropTypes.string.isRequired,
};
