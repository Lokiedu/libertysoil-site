import React from 'react'
import {TextPostComponent} from './post'

export default class RiverOfPostsComponent extends React.Component {
  render() {
    return (
      <div>
        <p>Hi, I am a river of posts</p>
        {this.props.posts.map((post) => <TextPostComponent {...post}/> )}
      </div>
    )
  }
}
