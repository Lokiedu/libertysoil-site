import PropTypes from 'prop-types';
import React, { Component } from 'react';

const isBrowser =
     typeof window !== 'undefined'
  && typeof navigator !== 'undefined';

let CodeMirror;
if (isBrowser) {
  CodeMirror = require('react-codemirror2');
  require('codemirror/mode/sass/sass');
  require('codemirror/lib/codemirror.css');
}

export default class LessEditor extends Component {
  state = {
    code: null
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

  render() {
    const options = {
      lineNumbers: true,
      readOnly: true,
    };

    return (
      <div>
        <div className="title">{this.props.file}</div>
        {isBrowser &&
          <CodeMirror value={this.props.code} options={options} />
        }
      </div>
    );
  }
}

LessEditor.propTypes = {
  code: PropTypes.string.isRequired, //eslint-disable-line
  file: PropTypes.string.isRequired,
};

