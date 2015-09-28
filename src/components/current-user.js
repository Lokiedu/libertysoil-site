import React from 'react'
import Gravatar from 'react-gravatar';

import User from './user';

export default class CurrentUser extends React.Component {
  render() {
    return <User user={this.props.user} avatarSize="80" />;
  }
}
