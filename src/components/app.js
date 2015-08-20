import React from 'react';

export default class App extends React.Component {
  render() {
    return (
      <div>
        <p>Hello, world!</p>
        {this.props.children}
      </div>
    )
  }
}
