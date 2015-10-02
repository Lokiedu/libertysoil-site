import React from 'react';
import { connect } from 'react-redux';
/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { Link } from 'react-router';
import request from 'superagent';

import {API_HOST} from '../config';
import {addError, removeAllMessages, addMessage} from '../store';

import Footer from '../components/footer';
import Login from '../components/login';
import Register from '../components/register';
import Header from '../components/header';
import Messages from '../components/messages';

class AuthContents extends React.Component {
  registerUser = (user) => {
    let {dispatch} = this.props;

    dispatch(removeAllMessages());

    (async () => {
      // FIXME: disable form
      try {
        let result = await request.post(`${API_HOST}/api/v1/users`).type('form').send(user);

        if ('error' in result.body) {
          // FIXME: enable form again
          dispatch(addError(result.body.error));
          return;
        }

        dispatch(addMessage('User is registered successfully'));
      } catch (e) {
        // FIXME: enable form again

        if (e.response && ('error' in e.response.body)) {
          // FIXME: enable form again
          dispatch(addError(e.response.body.error));
          return;
        } else {
          dispatch(addError('Server seems to have problems. Retry later, please'));
          return;
        }
      }
    })();
  }

  loginUser = (login_data) => {
    let {dispatch} = this.props;

    dispatch(removeAllMessages());

    (async () => {
      dispatch(removeAllMessages());

      try {
        let result = await request.post(`${API_HOST}/api/v1/session`).type('form').send(login_data);

        if (result.body.success) {
          dispatch(setCurrentUser(result.body.user));
        } else {
          dispatch(addError('Invalid username or password'));
        }
      } catch (e) {
        dispatch(addError('Invalid username or password'));
      }
    })();
  }

  render () {
    let {is_logged_in} = this.props;

    if (is_logged_in) {
      return <div className="area__body">
        <div className="message">
          <div className="message__body">
            You're logged in already. You can proceed to <Link to="/" className="header__toolbar_item">your feed</Link>
          </div>
        </div>
      </div>;
    }

    return <div>
      <div className="area__body layout-align_start">
        <Login onLoginUser={this.loginUser} />
        <Register onRegisterUser={this.registerUser} />
      </div>
    </div>
  }
}

class Auth extends React.Component {
  render() {
    let messages;
    let { dispatch, current_user, is_logged_in } = this.props;

    if (this.props.messages.length) {
      messages = <div className="layout layout__space layout-align_center">
        <Messages messages={this.props.messages}/>
      </div>;
    }

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user} />
        <div className="page__body page__body-rows">
          {messages}
          <div className="area">
            <AuthContents is_logged_in={is_logged_in} messages={this.props.messages} dispatch={dispatch} />
          </div>
        </div>
        <Footer/>
      </div>
    )
  }
}

function select(state) {
  return state.toJS();
}

export default connect(select)(Auth);
