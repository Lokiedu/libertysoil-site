import React from 'react'
import _ from 'lodash'

import {TextPostComponent} from './post'
import {CreatePost} from './CreatePost'

export default class RiverOfPostsComponent extends React.Component {
  render() {
    if (_.isUndefined(this.props.river)) {
      return <script/>;
    }

    let posts = this.props.river.map(id => this.props.posts[id])

    return (
      <div>
        <CreatePost />
        {posts.map((post) => <TextPostComponent post={post} author={this.props.users[post.user_id]} key={post.id}/> )}
      </div>
    )
  }
}
