import React from 'react'
import request from 'superagent';

import {API_HOST} from '../config'
import {getStore, addError, addPost} from '../store';

export class CreatePost extends React.Component {
  async submitHandler(event) {
    event.preventDefault();

    let form = event.target;
    try {
      let result = await request.post(`${API_HOST}/api/v1/posts`).type('form').send({text: form.text.value});
      form.text.value = '';

      getStore().dispatch(addPost(result.body));
    } catch (e) {
      getStore().dispatch(addError(e.message));
    }
  }

  render() {
    return (
      <div className="box box-post box-space_bottom">
        <form onSubmit={this.submitHandler} action="" method="post">
          <div className="box__body">
            <div className="layout__row">
              <textarea className="input input-textarea input-block" placeholder="Share some knowledge" name="text" />
            </div>
            <div className="layout__row layout layout-align_right">
              <button className="button button-wide button-green" type="submit">Post</button>
            </div>
          </div>
        </form>
      </div>
    )
  }
}
