import { createStore } from 'redux';

const ADD_USER = 'ADD_USER';
const ADD_POST = 'ADD_POST';

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

let i = 1;

function theReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_USER:
      let user = action.user;
      user.id = i++;

      return Object.assign({}, state, {
        users: [...state.users, user]
      });

      break;

    case ADD_POST:
      let post = action.post;
      post.id = i++;

      return Object.assign({}, state, {
        posts: [...state.posts, post]
      });
      break;
  }

  return state
}

let initialState = {
  users: [],
  posts: []
};


let store = createStore(theReducer, initialState);

store.dispatch(addUser('johndoe', 'johndoe@example.com', 'John', 'Doe', 'http://api.randomuser.me/portraits/thumb/women/39.jpg'));
store.dispatch(addPost(1, 'Hello, world! This is my first post'));

export default store;
