import React from 'react'
import {TextPostComponent} from './post'

export default class RiverOfPostsComponent extends React.Component {
  render() {
    let posts = [];

    posts.push(<TextPostComponent/>);
    posts.push(<TextPostComponent/>);
    posts.push(<TextPostComponent/>);
    posts.push(<TextPostComponent/>);
    posts.push(<TextPostComponent/>);

    return (
      <div>
        <p>Hi, I am a river of posts</p>
        {posts}
      </div>
    )
  }
}
