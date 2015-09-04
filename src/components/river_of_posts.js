import React from 'react'
import {TextPostComponent} from './post'
import {CreatePost} from './CreatePost'

export default class RiverOfPostsComponent extends React.Component {
  render() {
    return (
      <div>
        <p>Hi, I am a river of posts</p>
        <br />
        <CreatePost />
        {this.props.posts.map((post) => <TextPostComponent post={post} key={post.id}/> )}
      </div>
    )
  }
}
