/**
 * Originally taken from https://github.com/facebook/react/blob/master/docs/_js/live_editor.js
 * Formatted and adopted to use at LibertySoil's UI Kit.
 **/
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { transform } from 'babel-core';
import babelPresetES2015 from 'babel-preset-es2015';
import babelPresetReact from 'babel-preset-react';

import CodeMirrorEditor from './codemirror';
//import { _require } from '../utils/browser';

const match = RegExp(
  "^\.\/"
    + "("
      + "("
        + "(api\/client)|(utils\/"
          + "(browser|command|lang|loader|message|paragraphify|tags|urlGenerator)"
        + ")"
      + ")|"
      + "("
        + "(components|actions|consts|definitions|external|less|pages|(prop-types)|selectors|triggers)"
        + "\/.*"
      + ")|"
      + "([a-zA-Z]{1,})" // root directory
    + ")"
  + "\.(js|less)$"
);

export const selfCleaningTimeout = ComposedComponent => class extends React.Component {
  static displayName = 'selfCleaningTimeout'
    .concat(ComposedComponent.displayName);

  componentDidUpdate() {
    clearTimeout(this.timeoutID);
  }

  setTimeout = () => {
    clearTimeout(this.timeoutID);
    this.timeoutID = setTimeout.apply(null, arguments);
  };

  render() {
    return (
      <ComposedComponent
        setTimeout={this.setTimeout}
        {...this.props}
      />
    );
  }
};

const demoErrorStyle = { overflowX: 'auto' };

class UnwrappedReactPlayground extends React.Component {
  static propTypes = {
    codeText: PropTypes.string.isRequired,
    showLineNumbers: PropTypes.bool,
    transformer: PropTypes.func,
  };

  static defaultProps = (() => ({
    transformer: (code, options) => {
      const presets = [babelPresetReact];
      if (!options || !options.skipES2015Transform) {
        presets.push(babelPresetES2015);
      }
      return transform(code, { presets }).code;
    },
    showLineNumbers: false,
  }))()

  constructor(props, ...args) {
    super(props, ...args);
    this.state = {
      code: this.props.codeText,
    };
  }

  componentDidMount() {
    this.executeCode();
  }

  componentDidUpdate(prevProps, prevState) {
    // execute code only when the state's not being updated by switching tab
    // this avoids re-displaying the error, which comes after a certain delay
    if (this.props.transformer !== prevProps.transformer ||
        this.state.code !== prevState.code) {
      this.executeCode();
    }
  }

  handleCodeChange = value => {
    this.setState({ code: value });
    this.executeCode();
  };

  compileCode = options => {
    return this.props.transformer(this.state.code, options);
  };

  executeCode = () => {
    const mountNode = this.mount;

    try {
      ReactDOM.unmountComponentAtNode(mountNode);
    } catch (e) {} // eslint-disable-line no-empty

    try {
      const compiledCode = this.compileCode({ skipES2015Transform: false });

      if (!('require' in window)) {
        let req;
        try {
          req = require.context('..', true, /^\.\/(((api\/client)|(utils\/(browser|command|lang|loader|message|paragraphify|tags|urlGenerator)))|((components|actions|consts|definitions|external|less|pages|(prop-types)|selectors|triggers)\/.*)|([a-zA-Z]{1,}))\.(js|less)$/);
        } catch (e) {
          console.log(e);
          throw e;
        }

        // .keys()
        window['req'] = req;

        window['require'] = moduleName => {
          switch (moduleName) {
            case 'less': return require('less');
            case 'less/lib/browser-less': return require('less/lib/less-browser');
            case 'react': return require('react');
            case 'react-dom': return require('react-dom');
            default: return req(moduleName);
            // default: return require(`../components/${moduleName}`);
          }
        };
      }

      eval(compiledCode);
    } catch (e) {
      // Babel errors are preformatted, runtime errors are not.
      const errorMessage = e._babel
        ? <pre style={demoErrorStyle} className="playgroundError">{err.toString()}</pre>
        : <div className="playgroundError">{e.toString()}</div>;

      console.log(e);

      this.props.setTimeout(() => {
        ReactDOM.render(errorMessage, mountNode);
      }, 500);
    }
  };

  render() {
    return (
      <div className="playground">
        <div className="playgroundCode">
          <CodeMirrorEditor
            onChange={this.handleCodeChange}
            className="playgroundStage"
            codeText={this.state.code}
            lineNumbers={this.props.showLineNumbers}
          />
        </div>
        <div className="playgroundPreview">
          <div ref={c => this.mount = c} />
        </div>
      </div>
    );
  }
}

export const ReactPlayground = selfCleaningTimeout(UnwrappedReactPlayground);
