import { createStore } from 'redux'
import Immutable, { Map } from 'immutable'
import _ from 'lodash'

import messageType from './consts/messageTypeConstants';

const ADD_USER = 'ADD_USER';

const ADD_POST = 'ADD_POST';
const ADD_POST_TO_RIVER = 'ADD_POST_TO_RIVER';
const SET_POSTS_TO_RIVER = 'SET_POSTS_TO_RIVER';
const SET_USER_POSTS = 'SET_USER_POSTS';
const SET_LIKES = 'SET_LIKES';

const ADD_ERROR = 'ADD_ERROR';
const REMOVE_MESSAGE = 'REMOVE_MESSAGE';
const REMOVE_ALL_MESSAGES = 'REMOVE_ALL_MESSAGES';

const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const SET_CURRENT_USER = 'SET_CURRENT_USER';
const UPDATE_FOLLOW_STATUS = 'UPDATE_FOLLOW_STATUS';

export function addUser(user) {
  return {
    type: ADD_USER,
    user
  }
}

export function addPost(post) {
  return {
    type: ADD_POST,
    post
  }
}

export function addPostToRiver(post) {
  return {
    type: ADD_POST_TO_RIVER,
    post
  }
}

export function setPostsToRiver(posts) {
  return {
    type: SET_POSTS_TO_RIVER,
    posts
  }
}

export function setUserPosts(posts) {
  return {
    type: SET_USER_POSTS,
    posts
  }
}

export function setLikes(user_id, likes) {
  return {
    type: SET_LIKES,
    user_id,
    likes
  }
}

export function addError(message) {
  return {
    type: ADD_ERROR,
    message
  }
}

export function removeMessage(index) {
  return {
    type: REMOVE_MESSAGE,
    index
  }
}

export function removeAllMessages() {
  return {
    type: REMOVE_ALL_MESSAGES
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
  let userToStateCut = user => {
    let users = {};

    if ('following' in user) {
      for (let followed_user of user.following) {
        users[followed_user.id] = followed_user;
      }

      user = _.cloneDeep(user)
      delete user.following
    }

    users[user.id] = user;

    return {users: users};
  };

  switch (action.type) {
    case ADD_USER: {
      state = state.mergeDeep(Immutable.fromJS(userToStateCut(action.user)));
      state = state.setIn(
        ['following', action.user.id],
        action.user.following.map(user => user.id)
      );
      break;
    }

    case ADD_POST: {
      let user = action.post.user

      let postCopy = _.cloneDeep(action.post);
      delete postCopy.user;

      let cut = {posts: {}, users: {}};
      cut.users[user.id] = user;
      cut.posts[postCopy.id] = postCopy;

      state = state.mergeDeep(Immutable.fromJS(cut));
      break;
    }

    case ADD_POST_TO_RIVER: {
      let user = action.post.user

      let postCopy = _.cloneDeep(action.post);
      delete postCopy.user;

      let cut = {users: {}, posts: {}};
      cut.users[user.id] = user;
      cut.posts[postCopy.id] = postCopy

      state = state.mergeDeep(Immutable.fromJS(cut));
      state = state.updateIn(['river'], posts => posts.unshift(postCopy.id))
      break;
    }

    case SET_POSTS_TO_RIVER: {
      let posts = action.posts;

      let postsWithoutUsers = action.posts.map(post => {
        let postCopy = _.cloneDeep(post);
        delete postCopy.user;
        return postCopy;
      });

      let users = _.unique(posts.map(post => post.user), 'id')

      let cut = {users: {}, posts: {}};
      for (let user of users) {
        cut.users[user.id] = user;
      }

      let river = []
      for (let post of postsWithoutUsers) {
        cut.posts[post.id] = post;
        river.push(post.id);
      }

      state = state.mergeDeep(Immutable.fromJS(cut));
      state = state.set('river', Immutable.fromJS(river));
      break;
    }

    case SET_USER_POSTS: {
      let cut = {posts: {}, user_posts: {}};

      for (let post of action.posts) {
        cut.posts[post.id] = post;
      }

      cut.user_posts[action.posts[0].user_id] = action.posts.map(post => post.id);

      state = state.mergeDeep(Immutable.fromJS(cut));
      break;
    }

    case ADD_ERROR: {
      state = state.updateIn(['messages'], messages => messages.push({
        type: messageType.ERROR,
        message: action.message
      }))
      break;
    }

    case REMOVE_MESSAGE: {
      var messages = state.get('messages').toJS();

      messages.splice(action.index, 1);

      state = state.set('messages', Immutable.fromJS(messages));
      break;
    }

    case REMOVE_ALL_MESSAGES: {
      state = state.set('messages', Immutable.fromJS([]));
      break;
    }

    case SET_CURRENT_USER: {
      let cut = userToStateCut(action.user)
      cut.is_logged_in = true
      cut.current_user = action.user.id

      state = state.mergeDeep(Immutable.fromJS(cut));

      state = state.setIn(
        ['following', action.user.id],
        action.user.following.map(user => user.id)
      );
      break;
    }
    case SET_LIKES: {
      state = state.setIn(['likes', action.user_id], action.likes);
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
  user_posts: {},
  follows:{},
  likes: {},
  posts: {},
  river: [],
  messages: [],
  is_logged_in: false,
  current_user: null
};

let store;

export function initState(state=initialState) {
  store = createStore(theReducer, Immutable.fromJS(state));
  return store;
}

export function getStore() {
  return store;
}
