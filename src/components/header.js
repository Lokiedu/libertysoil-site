import React from 'react'

export default class HeaderComponent extends React.Component {
  render() {
    return (
      <div>
        <h1>Hi, I am the header</h1>
        <p>My name is: {this.props.currentUser.username}</p>
        <button>Logout</button>
      </div>
    )
  }
}
