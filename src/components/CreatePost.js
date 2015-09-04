import React from 'react'

export class CreatePost extends React.Component {
  render() {
    return (
      <div className="box box-post box-space_bottom">
        <div className="box__body">
          <div className="layout__row">
            <textarea className="input input-textarea input-block" placeholder="Share some knowledge"></textarea>
          </div>
          <div className="layout__row layout layout-align_right">
            <button className="button button-wide button-green" disabled="disabled">Post</button>
          </div>
        </div>
      </div>
    )
  }
}
