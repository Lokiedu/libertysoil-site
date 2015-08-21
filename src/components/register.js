import React from 'react'

export default class RegisterComponent extends React.Component {
  render() {
    return (
      <div className="page__body">
        <div className="area">
          <div className="area__body layout-align_start">
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
            <div className="box box-middle">
              <header className="box__title">Register</header>
              <div className="box__body">
                <div className="layout__row">
                  <div className="form__row">
                    <label className="label label-block">First name</label>
                    <input className="input" type="text"/>
                  </div>
                  <div className="form__row">
                    <label className="label label-block">Last name</label>
                    <input className="input" type="text"/>
                  </div>
                  <div className="form__row">
                    <label className="label label-block">Email</label>
                    <input className="input" type="email"/>
                  </div>
                  <div className="form__row">
                    <label className="label label-block">Password</label>
                    <input className="input" type="password"/>
                  </div>
                  <div className="form__row">
                    <label className="label label-block">Repeat password</label>
                    <input className="input" type="password"/>
                  </div>
                </div>
                <div className="layout__row layout layout-align_vertical layout-align_justify">
                  <button className="button button-yellow">Login</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
