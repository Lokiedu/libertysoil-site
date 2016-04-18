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
import React, { Component, PropTypes } from 'react';
import { throttle } from 'lodash';

import { Tabs, Tab, TabTitle, TabContent } from './tabs';
import VisibilitySensor from './visibility-sensor';

export default class Reviews extends Component {
  static propTypes = {
    quotes: PropTypes.arrayOf(PropTypes.shape({
      avatar_url: PropTypes.string,
      first_name: PropTypes.string,
      last_name: PropTypes.string,
      text: PropTypes.string,
      description: PropTypes.string,
      link: PropTypes.string
    }))
  };

  state = {
    mobile: true,
    active: 0,
    sliding: false
  };

  slideshow = null;
  imageHovered = false;
  length = 0;
  delay = 5000;
  clientWidth = 0;

  componentDidMount() {
    this.toggleMode();
    window.addEventListener('resize', this.toggleMode);
    document.addEventListener('DOMContentLoaded', this.toggleMode);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.toggleMode);
    document.removeEventListener('DOMContentLoaded', this.toggleMode);
  }

  toggleSlideshow = (isVisible) => {
    switch (!this.state.mobile && isVisible) {
      case true: {
        if (!this.slideshow) {
          this.slideshow = setInterval(this.changeSlide, this.delay);
        }
        break;
      }
      case false: {
        if (this.slideshow) {
          clearInterval(this.slideshow);
          this.slideshow = null;
        }
        break;
      }
    }
  };

  clickHandler = (activeId) => {
    this.setState({ active: activeId });
  };

  changeSlide = () => {
    if (this.imageHovered) {
      return;
    }

    let newActive = this.state.active;
    if (this.state.active === this.length - 1) {
      newActive = 0;
    } else {
      ++newActive;
    }

    this.setState({ sliding: true });
    setTimeout(() => {
      this.setState({ active: newActive, sliding: false });
    }, 500);
  };

  toggleMode = throttle(() => {
    const breakpointWidth = 1024;
    const clientWidth = document.body.clientWidth;

    if (clientWidth === this.clientWidth) {
      return;
    }

    if (clientWidth >= breakpointWidth) {
      this.setState({ mobile: false });
    }

    if (clientWidth < breakpointWidth) {
      this.setState({ mobile: true });
    }

    if (this.clientWidth == 0 && clientWidth <= breakpointWidth) {
      this.setState({ mobile: true });
    }

    this.clientWidth = clientWidth;
  }, 100);

  render() {
    const { quotes } = this.props;

    if (!quotes || !quotes.length) {
      return <script />;
    }

    this.length = quotes.length;
    let preparedQuotes;
    if (this.state.mobile) {
      preparedQuotes = quotes.map((q, i) => (
        <blockquote key={i} className="review">
          <p className="review__body content">
            {q.text}
          </p>
          <footer className="review__author">
            <section className="user_box">
              <img className="user_box__avatar" src={q.avatar_url} width="64px" height="64px" alt=""/>
              <div className="user_box__body">
                <p className="user_box__name"><b>{q.first_name} {q.last_name}</b></p>
                { q.description &&
                  <p className="user_box__text">
                    <a href={q.link}>
                      {q.description}
                    </a>
                  </p>
                }
              </div>
            </section>
          </footer>
        </blockquote>
      ));
    } else {
      let reviewClassName = 'review__body content';
      if (this.state.sliding) {
        reviewClassName += ' review__body-sliding';
      }

      const tabs = quotes.map((q, i) => (
        <Tab key={i}>
          <TabTitle className="review_group__navigation_item" classNameActive="review_group__navigation_item-active">
            <img onMouseOver={() => this.imageHovered = true}
                 onMouseOut={() => this.imageHovered = false}
                 className="user_box__avatar"
                 src={q.avatar_url}
                 width="64"
                 height="64"
                 alt=""/>
          </TabTitle>
          <TabContent>
            <blockquote className="review">
              <p className={reviewClassName}>
                {q.text}
              </p>
              <footer className="review__author">
                <section className="user_box">
                  <div className="user_box__body">
                    <p className="user_box__name"><b>{q.first_name} {q.last_name}</b></p>
                    { q.description &&
                      <p className="user_box__text">
                        <a href={q.link}>
                          {q.description}
                        </a>
                      </p>
                    }
                  </div>
                </section>
              </footer>
            </blockquote>
          </TabContent>
        </Tab>
      ));

      preparedQuotes = (
        <VisibilitySensor onMount={this.toggleSlideshow} onChange={this.toggleSlideshow}>
          <Tabs active={this.state.active} onClick={this.clickHandler} invert menuClassName="review_group__navigation page__body width">
            {tabs}
          </Tabs>
        </VisibilitySensor>
      );
    }

    return <div>
        <div className="page__container-bg">
        <div className="page__body page__body-rows width">
          <h2 className="page__title content-center layout__space"></h2>
        </div>
      </div>
      <div className="review_group">
        <div className="page__body page__body-rows width">
          <div className="review_group__reviews">
            {preparedQuotes}
          </div>
        </div>
      </div>
    </div>;
  }
}
