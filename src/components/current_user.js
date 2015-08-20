import React from 'react'

export default class CurrentUserComponent extends React.Component {
  render() {
    return (
      <div>
        <p>I am {this.props.currentUser.username}</p>
        <img src={this.props.currentUser.userPic} alt=""/>
      </div>
    )
  }
}
