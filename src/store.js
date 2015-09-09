import { createStore } from 'redux'
import Immutable, { Map } from 'immutable'
import _ from 'lodash'

const ADD_USER = 'ADD_USER';
const ADD_POST = 'ADD_POST';
const SET_POSTS = 'SET_POSTS';
const ADD_ERROR = 'ADD_ERROR';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const SET_CURRENT_USER = 'SET_CURRENT_USER';

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

export function loginSuccess() {
  return {
    type: LOGIN_SUCCESS
  }
}

export function setCurrentUser(user) {
  return {
    type: SET_CURRENT_USER,
    user
  }
}

function theReducer(state, action) {
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

      let postsWithoutUsers = action.posts.map(post => {
        let postCopy = _.cloneDeep(post);
        delete postCopy.user;
        return postCopy;
      });

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
      state = state.updateIn(['messages'], messages => messages.push(action.message))
      break;
    }

    case SET_CURRENT_USER: {
      state = state.set('is_logged_in', true);
      state = state.set('current_user', action.user);
      break;
    }
  }

  return state
}

let initialState = {
  users: {},
  posts: [],
  messages: [],
  is_logged_in: false,
  current_user: {}
};

let store;

export function initState(state=initialState) {
  store = createStore(theReducer, Immutable.fromJS(state));
  return store;
}

export function getStore() {
  return store;
}
