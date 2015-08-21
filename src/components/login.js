import React from 'react'

export default class LoginComponent extends React.Component {
  render() {
    return (
      <div className="box box-middle">
        <header className="box__title">Login</header>
        <div className="box__body">
          <div className="layout__row">
            <div className="form__row">
              <label className="label label-block">Email</label>
              <input className="input" type="text"/>
            </div>
            <div className="form__row">
              <label className="label label-block">Password</label>
              <input className="input" type="password"/>
            </div>
          </div>
          <div className="layout__row layout layout-align_vertical layout-align_justify">
            <a href="#" className="link">Password reminder</a>
            <button className="button button-green">Login</button>
          </div>
        </div>
      </div>
    )
  }
}
