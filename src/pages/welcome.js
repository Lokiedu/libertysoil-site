/*
 This file is a part of libertysoil.org website
 Copyright (C) 2016  Loki Education (Social Enterprise)

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
import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import createSelector from '../selectors/createSelector';
import { ActionsTrigger } from '../triggers';
import Header from '../components/header';
import HeaderLogo from '../components/header-logo';
import WhatIsLibertySoil from '../components/WhatIsLibertySoil';
import Reviews from '../components/Reviews';
import Footer from '../components/footer';

class Welcome extends React.Component {

  static async fetchData(router, store, client) {
    const trigger = new ActionsTrigger(client, store.dispatch);

    await trigger.setQuotes();
  }

  render() {
    const { quotes } = this.props;

    let reviews;
    if (quotes && quotes.size) {
      reviews = <Reviews quotes={quotes} />;
    }

    return (
      <div>
        <Helmet title="Welcome to " />
        <div className="page__container-bg font-open_sans font-light">
          <section className="landing landing-big landing-bg">
            <Header is_logged_in={false} className="header-transparent" needMenu={false}>
              <HeaderLogo big />
            </Header>
            <header className="landing__header">
              <h1 className="landing__title">Education change network</h1>
              <p className="landing__details">Connect with people from around the world to make education better for everyone.<br />No action is too small.</p>
              <p className="landing__details"><a href="/auth" className="button button-big button-yellow">Join</a></p>
            </header>
          </section>
          <WhatIsLibertySoil />
          <div className="void void-space content content-center skin skin-red">
            <div className="width">
              <h2>Help more children reach better education</h2>
              <p>LibertySoil aims to make best schooling practises from around the world visible, accessible and actionable. Emotional and social development of the child are often overlooked in traditional school system. Join our growing community and help more children reach better education.
              </p>
              <p>We encourage people to collect, share and discuss resources on teaching and learning, helping to build a better understanding of the diversity within education. We aim to help families and schools solve problems like bullying, academic pressure, depression, anxiety, professional and social isolation, to name just a few. Needless to say, poor early life experiences negatively affect each person and a society as a whole.</p>
            </div>

            {/*<div className="page__body">
              <div className="page__content">
                <div className="layout__space">
                  <h1 className="page__title">Popular Posts</h1>
                  <div className="layout__row">
                    <section className="post_card layout__row layout__row-double">
                      <header className="post_card__title"><a href="#">Some notes on famous experiment</a></header>
                      <div className="post_card__author">
                        <section className="user_box">
                          <div className="user_box__body">
                            <p className="user_box__name">User Name</p>
                          </div>
                        </section>
                      </div>
                      <div className="post_card__footer layout">
                        <span className="layout__grid_item">3 <span className="icon fa fa-heart-o"></span></span>
                        <span className="layout__grid_item">12 <span className="icon fa fa-star-o"></span></span>
                        <span className="layout__grid_item">3 <span className="icon fa fa-comment-o"></span></span>
                      </div>
                    </section>
                    <section className="post_card layout__row layout__row-double">
                      <header className="post_card__title"><a href="#">Some notes on famous experiment</a></header>
                      <div className="post_card__author">
                        <section className="user_box">
                          <div className="user_box__body">
                            <p className="user_box__name">User Name</p>
                          </div>
                        </section>
                      </div>
                      <div className="post_card__footer layout">
                        <span className="layout__grid_item">3 <span className="icon fa fa-heart-o"></span></span>
                        <span className="layout__grid_item">12 <span className="icon fa fa-star-o"></span></span>
                        <span className="layout__grid_item">3 <span className="icon fa fa-comment-o"></span></span>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
              <aside className="page__sidebar">
                <div className="layout__space">
                  <div className="layout__row layout__row-double">
                    <div className="group layout__row">
                      <div className="layout__row">
                        <h3 className="head">Most followed people</h3>
                      </div>
                      <section className="layout__row user_box">
                        <img className="user_box__avatar" src="http://placehold.it/32x32" alt=""/>
                        <div className="user_box__body">
                          <p className="user_box__name">User Name</p>
                          <p className="user_box__text">Math teacher</p>
                        </div>
                      </section>
                      <section className="layout__row user_box">
                        <img className="user_box__avatar" src="http://placehold.it/32x32" alt=""/>
                        <div className="user_box__body">
                          <p className="user_box__name">User Name</p>
                          <p className="user_box__text">Math teacher</p>
                        </div>
                      </section>
                      <section className="layout__row user_box">
                        <img className="user_box__avatar" src="http://placehold.it/32x32" alt=""/>
                        <div className="user_box__body">
                          <p className="user_box__name">User Name</p>
                          <p className="user_box__text">Math teacher</p>
                        </div>
                      </section>
                      <section className="layout__row user_box">
                        <img className="user_box__avatar" src="http://placehold.it/32x32" alt=""/>
                        <div className="user_box__body">
                          <p className="user_box__name">User Name</p>
                          <p className="user_box__text">Math teacher</p>
                        </div>
                      </section>
                    </div>
                  </div>
                  <div className="group layout__row layout__row-double">
                    <div className="layout__row">
                      <h3 className="head">Popular tags</h3>
                    </div>
                    <div className="layout__row">
                      <div className="tags">
                        <span className="tag">Psychology</span>
                        <span className="tag">Gaming</span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>*/}
          </div>
          {reviews}
          <Footer />
        </div>
      </div>
    );
  }
}

const selector = createSelector(
  state => state.get('quotes'),
  quotes => ({
    quotes
  })
);

export default connect(selector)(Welcome);
