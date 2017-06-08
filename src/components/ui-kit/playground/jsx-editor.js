import React from 'react';

import CodeMirror from '../../../external/codemirror';

export default class JSXEditor extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    return (
      <div>
        <CodeMirror
          codeText={this.props.code}
          mode="jsx"
          onChange={this.props.onChange}
        />
      </div>
    );
  }
}
