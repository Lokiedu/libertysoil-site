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
import React, { Component } from 'react';

export default class Reviews extends Component {
  constructor (props) {
    super(props);

    this.state = {
      activeSlideId: 0
    };
  }

  changeSlide = slideId => {
    this.setState({
      activeSlideId: slideId
    });
  }

  render () {
    var activeSlideId = this.state.activeSlideId;

    return <div>
      <div className="page__container-bg">
        <div className="page__body page__body-rows">
          <h2 className="page__title content-center layout__space">What people say</h2>
        </div>
      </div>
      <div className="review_group">
        <div className="page__body page__body-rows">
          <div className="review_group__reviews">
            {activeSlideId == 0 && <blockquote className="review">
              <p className="review__body content">
                I use LibertySoil to collect <a href="#">video lectures on math</a> to use in my class.
              </p>
              <footer className="review__author">
                <section className="user_box">
                  <div className="user_box__body">
                    <p className="user_box__name">User Name</p>
                    <p className="user_box__text">Math teacher</p>
                  </div>
                </section>
              </footer>
            </blockquote>}
            {activeSlideId == 1 && <blockquote className="review">
              <p className="review__body content">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab beatae eum excepturi facilis fugiat in, perferendis quae quis quo quos rem, sapiente sequi vel! Eligendi itaque non quae quisquam tempora?
              </p>
              <footer className="review__author">
                <section className="user_box">
                  <div className="user_box__body">
                    <p className="user_box__name">User Name</p>
                    <p className="user_box__text">Math teacher</p>
                  </div>
                </section>
              </footer>
            </blockquote>}
          </div>
        </div>
      </div>
      <div className="page__container-bg">
        <div className="review_group__navigation page__body">
          <ReviewUser onClick={this.changeSlide} index="0" activeIndex={activeSlideId} avatarUrl="http://placehold.it/64x64" />
          <ReviewUser onClick={this.changeSlide} index="1" activeIndex={activeSlideId} avatarUrl="http://placehold.it/64x64" />
        </div>
      </div>
    </div>;
  };
}

class ReviewUser extends Component {
  clickHandler = () => {
    var { onClick, index } = this.props;

    onClick(index);
  }

  render () {
    var { index, activeIndex, avatarUrl } = this.props;
    var cn = 'review_group__navigation_item ';

    if (index == activeIndex) {
      cn += 'review_group__navigation_item-active';
    }

    return <div onClick={this.clickHandler} className={cn}>
      <div className="user_box">
        <img className="user_box__avatar" src={avatarUrl} alt=""/>
      </div>
    </div>;
  }
}
