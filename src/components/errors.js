import React from 'react';

export default class Errors extends React.Component {
  render() {
    let errTags = this.props.messages.map((msg) => <p>{msg}</p>)

    return <div>{errTags}</div>
  }
}
