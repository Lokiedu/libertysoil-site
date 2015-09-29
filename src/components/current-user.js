import React from 'react'
import Gravatar from 'react-gravatar';
import _ from 'lodash';

import User from './user';

export default class CurrentUser extends React.Component {
  render() {
    if (_.isUndefined(this.props.user)) {
      return <script/>;
    }

    return <User user={this.props.user} />;
  }
}
