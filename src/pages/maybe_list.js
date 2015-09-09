import React from 'react';
import { connect } from 'react-redux';

import List from './list'
import Welcome from './welcome'

class MaybeList extends React.Component {
  render() {
    if (this.props.is_logged_in) {
      return <List/>
    } else {
      return <Welcome/>
    }
  }
}

function select(state) {
  return state.toJS();
}

export default connect(select)(MaybeList);
