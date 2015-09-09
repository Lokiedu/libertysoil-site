import React from 'react';

import Header from '../components/header';
import Footer from '../components/footer';

export default class Welcome extends React.Component {
  render() {
    return <div>
      <Header is_logged_in={false} />

      <div className="page__container">
        <div className="page__body">
          <div className="page__sidebar">
          </div>

          <div className="page__content">
            <h1>Hello, anonymous!</h1>
            <p>Authenticate, please, to see your subscriptions</p>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  }
}
