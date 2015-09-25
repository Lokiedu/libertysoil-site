import { createStore } from 'redux'
import Immutable, { Map } from 'immutable'
import _ from 'lodash'

const ADD_USER = 'ADD_USER';
const SET_USER = 'SET_USER';
const ADD_POST = 'ADD_POST';
const SET_POSTS = 'SET_POSTS';
const ADD_ERROR = 'ADD_ERROR';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const SET_CURRENT_USER = 'SET_CURRENT_USER';
const UPDATE_FOLLOW_STATUS = 'UPDATE_FOLLOW_STATUS';

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

export function addPost(post) {
  return {
    type: ADD_POST,
    post
  }
}

export function setPosts(posts) {
  return {
    type: SET_POSTS,
    posts
  }
}

export function setUser(user) {
  return {
    type: SET_USER,
    user
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

export function updateFollowStatus(status) {
  return {
    type: UPDATE_FOLLOW_STATUS,
    status
  }
}

function theReducer(state, action) {
  switch (action.type) {
    case ADD_USER: {
      let user = action.user;

      let cut = {users: {}};
      cut.users[user.id] = user;

      state = state.mergeDeep(Immutable.fromJS(cut));
      break;
    }

    case ADD_POST: {
      let user = action.post.user

      let cut = {users: {}};
      cut.users[user.id] = user;
      state = state.mergeDeep(Immutable.fromJS(cut));

      let postCopy = _.cloneDeep(action.post);
      delete postCopy.user;

      state = state.updateIn(['posts'], posts => posts.unshift(Immutable.fromJS(postCopy)))
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

      state = state.set('posts', Immutable.fromJS(postsWithoutUsers));

      let cut = {users: {}};
      for (let user of users) {
        cut.users[user.id] = user;
      }

      state = state.mergeDeep(Immutable.fromJS(cut));
      break;
    }

    case ADD_ERROR: {
      state = state.updateIn(['messages'], messages => messages.push(action.message))
      break;
    }

    case SET_CURRENT_USER: {
      state = state.set('is_logged_in', true);
      state = state.set('current_user', Immutable.fromJS(action.user));
      break;
    }

    case SET_USER: {
      state = state.set('user', Immutable.fromJS(action.user));
      break;
    }

    case UPDATE_FOLLOW_STATUS: {
      console.log('changes');
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
