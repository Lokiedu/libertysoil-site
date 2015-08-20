import React from 'react'

export default class FooterComponent extends React.Component {
  render () {
    return (
      <footer className="page__footer footer">
        <nav className="footer_nav">
          <a href="#">About</a>
          <a href="#">FAQ</a>
          <a href="#">Terms of service</a>
          <a href="#">Privacy policy</a>
        </nav>
        <p><a href="#">mail@libertysoil.org</a></p>
      </footer>
    )
  }
}
