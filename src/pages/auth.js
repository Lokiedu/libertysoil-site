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
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import ApiClient from '../api/client'
import { API_HOST } from '../config';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';
import Footer from '../components/footer';
import Login from '../components/login';
import Register from '../components/register';
import Header from '../components/header';
import Messages from '../components/messages';


export class Auth extends React.Component {

  static propTypes = {
    messages: PropTypes.arrayOf(React.PropTypes.object).isRequired,
    ui: PropTypes.shape({
      registrationSuccess: PropTypes.bool
    }).isRequired
  };

  static async fetchData(params, store) {
    const props = store.getState();
    const currentUserId = props.get('current_user').get('id');
    const isLoggedIn = (currentUserId !== null);

    if (!isLoggedIn) {
      return null;
    }

    const currentUser = props.get('users').get(currentUserId);
    const more = currentUser.get('more');
    const is_first_login = !more || more.get('first_login');

    if (is_first_login) {
      return {status: 307, redirectTo: '/induction'};
    }

    return {status: 307, redirectTo: '/'};
  }

  constructor() {
    super();
    this.counter = 0;
    this.titleBottomInitial;
    this.state = {
      isMobile: false,
      registerClicked: false,
      headerHidden: false, // check necessarity
      loginVisible: true // above
    };
  }

  componentDidMount() {
    const isMobile = window.innerWidth < 680;
    this.setState({ isMobile: isMobile });

    if (!isMobile) {
      window.addEventListener('scroll', this.scrollHandler);
      this.reg.addEventListener('click', this.registerClickHandler);

      const title = ReactDOM.findDOMNode(this.title);
      title.style.top = '0px'; // todo
      title.style.transition = 'top 0.1s'; 
      title.style.position = 'relative';
    }
  }

  scrollHandler = () => {
    const title = ReactDOM.findDOMNode(this.title);
    if (this.counter++ < 10) {
      this.titleBottomInitial = title.getBoundingClientRect().bottom;
    }

    // console.log(this.titleBottomInitial);
    const titleStyleTop = parseFloat(title.style.top);
    const titleTop = title.getBoundingClientRect().top;
    const titleBottom = title.getBoundingClientRect().bottom;
    const content = ReactDOM.findDOMNode(this.content);
    const contentTop = content.getBoundingClientRect().top;
    // console.log(titleTop, titleBottom, contentTop);

    if (contentTop > this.titleBottomInitial) {
      title.style.top = '0px';
      return;
    }
    if (titleTop <= 50) {
      this.setState({ headerTop: true });
      return;
    }
    this.setState({ headerTop: false });

    if ((this.titleBottomInitial > contentTop - 20)) { // 20, 30 - needs fix
      title.style.top = contentTop - 30 - this.titleBottomInitial + 'px';
      // console.log(title.style.top);
    } else if (titleBottom < contentTop - 30) {
      title.style.top = titleStyleTop + contentTop - 30 - titleBottom + 'px';
    }
  };

  registerClickHandler = () => {
    if (this.state.registerClicked)
      return;

    this.setState({ registerClicked: true });
    this.cropLanding();
  };

  cropLanding() {
    // animated scroll goes here
    window.scrollBy(0, 500); // todo
  }

  render() {
    let { current_user, is_logged_in, messages, ui } = this.props;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    
    let classToHeader = 'header-transparent header-transparent_border';
    let classToLanding = 'landing landing-big landing-bg landing-bg_fixed landing-bg_house layout__row-group';
    let classToLandingClone = classToLanding + ' landing-fixed_sticky';
    let classToLandingBody = 'landing__body';
    let login = '';

    if (!this.state.isMobile) {
      classToLanding += ' landing-full';
      classToLandingBody += ' landing__body-fixed';

      if (this.state.loginVisible) {
        classToHeader += ' landing__header-fixed';
        login = (<Login ref="login" onLoginUser={triggers.login} />);
      } else {
        classToHeader += ' landing__header-abs';
      }

      if (!this.state.headerTop) {
        classToLandingClone += ' hidden';
      }
    }

    let renderedMessages;
    if (messages.length) {
      renderedMessages = (
        <div className="page__messages page__messages-modal">
          <div className="page__body page__body-small">
            <Messages messages={messages} removeMessage={triggers.removeMessage} />
          </div>
        </div>
      );
    }

    const registration_success = ui.registrationSuccess;
    // TODO: remove unnecessary refs
    return (
      <div className="page__container-bg font-open_sans font-light">
        <section ref={c => this.landing = c} className={classToLanding}>
          <Header
            is_logged_in={is_logged_in}
            current_user={current_user}
            className={classToHeader}
          />
          <header ref={c => this.landingBody = c} className={classToLandingBody}>
            <div ref={c => this.title = c} className="layout__row">
              <p className="layout__row layout__row-small landing__small_title" style={{ position: 'relative', left: 4 }}>Welcome to LibertySoil.org</p>
              <h1 className="landing__subtitle landing__subtitle-narrow">Education change network</h1>
            </div>
            { login }
          </header>
        </section>

        {renderedMessages}

        <div ref={c => this.content = c} className="page__content page__content-spacing page__content-cloudy layout__row-group">
          <div className="page__body page__body-small">
            <div ref={c => this.reg = c} className="layout__row">
              <Register
                registration_success={registration_success}
                onShowRegisterForm={triggers.showRegisterForm}
                onRegisterUser={triggers.registerUser}
              />
            </div>
          </div>
        </div>
        <div className="layout__row-group page__content-cloudy">
          <Footer/>
        </div>

        <section ref={c => this.landingClone = c} className={classToLandingClone}>
          <Header
            is_logged_in={is_logged_in}
            current_user={current_user}
            className='header-transparent header-transparent_border landing__header-abs'
          />
          <header className='landing__body landing__body-shortened'>
            <div className="layout__row" style={{ position: 'relative', top: 20 }}>
              <p className="layout__row layout__row-small landing__small_title" style={{ position: 'relative', left: 4 }}>Welcome to LibertySoil.org</p>
              <h1 className="landing__subtitle landing__subtitle-narrow">Education change network</h1>
            </div>
          </header>
        </section>
      </div>
    );
  }
}

export default connect(defaultSelector)(Auth);
