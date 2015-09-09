import React from 'react'
import request from 'superagent';
import { connect } from 'react-redux';
import _ from 'lodash';

import {API_HOST} from '../config';
import {getStore, addError} from '../store';

export default class RegisterComponent extends React.Component {
  async submitHandler(event) {
    event.preventDefault();

    let form = event.target;

    if (!form.agree.checked) {
      getStore().dispatch(addError('You have to agree to Terms before registering'));
      return;
    }

    if (form.password.value === '') {
      getStore().dispatch(addError('Passwords is not given'));
      return;
    }

    if (form.password.value !== form.password_repeat.value) {
      getStore().dispatch(addError('Passwords do not match'));
      return;
    }

    let user_data = {
      username: form.username.value,
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      password: form.password.value,
      email: form.email.value
    };

    // FIXME: disable form
    try {
      let result = await request.post(`${API_HOST}/api/v1/users`).type('form').send(user_data);

      if ('error' in result.body) {
        // FIXME: enable form again
        getStore().dispatch(addError(result.body.error));
        return;
      }

      alert('User is registered successfully');  // FIXME: send redux message instead
    } catch (e) {
      // FIXME: enable form again

      if ('error' in e.response.body) {
        // FIXME: enable form again
        getStore().dispatch(addError(e.response.body.error));
        return;
      } else {
        getStore().dispatch(addError('Server seems to have problems. Retry later, please'));
        return;
      }
    }
  };

  render() {
    return (
    <div className="box box-middle">
      <header className="box__title">Register</header>
      <form action="" onSubmit={this.submitHandler}>
        <div className="box__body">
          <div className="layout__row">
            <div className="form__row">
              <label className="label label-block label-space">Username</label>
              <input className="input input-block" type="text" name="username"/>
            </div>
            <div className="form__row">
              <label className="label label-block label-space">First name</label>
              <input className="input input-block" type="text" name="firstName"/>
            </div>
            <div className="form__row">
              <label className="label label-block label-space">Last name</label>
              <input className="input input-block" type="text" name="lastName"/>
            </div>
            <div className="form__row">
              <label className="label label-block label-space">Email</label>
              <input className="input input-block" type="email" name="email"/>
            </div>
            <div className="form__row">
              <label className="label label-block label-space">Password</label>
              <input className="input input-block" type="password" name="password"/>
            </div>
            <div className="form__row">
              <label className="label label-block label-space">Repeat password</label>
              <input className="input input-block" type="password" name="password_repeat"/>
            </div>
          </div>
          <div className="layout__row layout layout-align_vertical layout-align_justify">
            <label className="action layout layout-align_vertical"><input type="checkbox" className="checkbox" name="agree" /><span>I agree to <a href="#" className="link">T&C</a></span></label>
            <button className="button button-yellow">Send</button>
          </div>
        </div>
      </form>
    </div>
    )
  }
}
