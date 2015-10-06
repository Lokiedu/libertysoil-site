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
import React from 'react';

import Header from '../components/header';
import WhatIsLibertySoil from '../components/WhatIsLibertySoil';
import Reviews from '../components/Reviews';
import Footer from '../components/footer';

export default class Welcome extends React.Component {
  render() {
    return <div>
      <div className="page__container-bg">
        <section className="landing landing-big landing-bg">
          <Header is_logged_in={false} className="header-transparent" />
          <header className="landing__header">
            <h1 className="landing__title">Education in 21st century</h1>
            <p className="landing__details">LibertySoil is a place for education professionals to collect, share, and<br /> discuss information about freedom focused education</p>
            <p className="landing__details"><a href="/auth" className="button button-big button-yellow">Join</a></p>
          </header>
        </section>
        <WhatIsLibertySoil />
        <div className="void void-space content content-center skin skin-red">
          <h2><a href="#">What is free freedom focused education?</a></h2>
          <p>We are seeking an approach to education that is adapted more to children's needs and want to apply a humanistic perspective.</p>
        </div>
        <div className="page__body">
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
        </div>
      </div>
      <Reviews/>
      <Footer/>
    </div>
  }
}
