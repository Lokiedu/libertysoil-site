import { createStore } from 'redux'
import Immutable, { Map } from 'immutable'

const ADD_USER = 'ADD_USER';
const ADD_POST = 'ADD_POST';
const SET_POSTS = 'SET_POSTS';
const ADD_ERROR = 'ADD_ERROR';

function addUser(username, email, firstName, lastName, userPic) {
  return {
    type: ADD_USER,
    user: {
      username,
      email,
      firstName,
      lastName,
      userPic
    }
  }
}

function addPost(userId, text) {
  return {
    type: ADD_POST,
    post: {
      userId,
      text
    }
  }
}

export function setPosts(posts) {
  return {
    type: SET_POSTS,
    posts: posts
  }
}

export function addError(message) {
  return {
    type: ADD_ERROR,
    message
  }
}

function theReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_USER: {
      let user = action.user;

      let cut = {users: {}};
      cut.users[user.id] = user;

      state = state.mergeDeep(cut);
      break;
    }

    case ADD_POST: {
      let post = action.post;

      state = state.updateIn(['posts'], posts => posts.push(post))
      break;
    }

    case SET_POSTS: {
      let posts = action.posts;

      let postsWithoutUsers = action.posts.map(post => delete post.user);
      let users = _.unique(posts.map(post => post.user), 'id')

      state = state.set('posts', postsWithoutUsers);

      let cut = {users: {}};
      for (let user of users) {
        cut.users[user.id] = user;
      }

      state = state.mergeDeep(cut);
      break;
    }

    case ADD_ERROR: {
      state = state.updateIn(['messages'], messages => messages.push(message))
      break;
    }
  }

  return state
}

let initialState = Immutable.fromJS({
  users: {},
  posts: [],
  messages: []
});


let store = createStore(theReducer, initialState);

export default store;
