import React from 'react';
import request from 'superagent';
import { connect } from 'react-redux';

import {API_HOST} from '../config'
import {getStore, addError, removeAllMessages, setCurrentUser} from '../store';

export default class LoginComponent extends React.Component {
  async submitHandler(event) {
    event.preventDefault();

    let form = event.target;

    let login_data = {
      username: form.username.value,
      password: form.password.value
    };

    getStore().dispatch(removeAllMessages());

    try {
      let result = await request.post(`${API_HOST}/api/v1/session`).type('form').send(login_data);

      if (result.body.success) {
        getStore().dispatch(setCurrentUser(result.body.user));
      } else {
        getStore().dispatch(addError('Invalid username or password'));
      }
    } catch (e) {
      getStore().dispatch(addError('Invalid username or password'));
    }
  };

  render() {
    return (
      <div className="box box-middle">
        <header className="box__title">Login?</header>
        <form onSubmit={this.submitHandler} action="" method="post">
          <div className="box__body">
            <div className="layout__row">
              <div className="form__row">
                <label className="label label-block label-space">Username</label>
                <input className="input input-block" required="required" type="text" name="username"/>
              </div>
              <div className="form__row">
                <label className="label label-block label-space">Password</label>
                <input className="input input-block" required="required" type="password" name="password"/>
              </div>
            </div>
            <div className="layout__row layout layout-align_vertical layout-align_justify">
              {false && <a href="#" className="link">Password reminder</a>}
              <button type="submit" className="button button-wide button-green">Login</button>
            </div>
          </div>
        </form>
      </div>
    )
  }
}

