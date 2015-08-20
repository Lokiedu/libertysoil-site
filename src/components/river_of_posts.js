import React from 'react'
import {TextPostComponent} from './post'

export default class RiverOfPostsComponent extends React.Component {
  static get defaultProps() {
    return {
      posts: [
        {text: "Hi, I am a post with default text", key: Math.random()},
        {text: "Vestibulum id ligula porta felis euismod semper.", key: Math.random()},
        {text: "Maecenas faucibus mollis interdum.", key: Math.random()},
        {text: "Donec id elit non mi porta gravida at eget metus.", key: Math.random()},
        {text: "Etiam porta sem malesuada magna mollis euismod.", key: Math.random()}
      ]
    }
  }

  render() {
    let posts = [];


    return (
      <div>
        <p>Hi, I am a river of posts</p>
        {this.props.posts.map((post) => <TextPostComponent {...post}/> )}
      </div>
    )
  }
}
