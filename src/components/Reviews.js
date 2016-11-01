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

import { Tab, Tabs } from './tabs';
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

  constructor(props) {
    super(props);

    this.state = {
      active: 0,
      mobile: true,
      sliding: false
    };

    this.slideshow = null;
    this.imageHovered = false;
    this.length = 0;
    this.delay = 30000;
    this.clientWidth = 0;
  }

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
          this.startSlideshow();
        }
        break;
      }
      case false: {
        if (this.slideshow) {
          this.stopSlideshow();
        }
        break;
      }
    }
  };

  startSlideshow = () => {
    this.slideshow = setInterval(this.changeSlide, this.delay);
  };

  stopSlideshow = () => {
    clearInterval(this.slideshow);
    this.slideshow = null;
  };

  clickHandler = (activeId) => {
    this.panel.to(activeId);
    this.setState({ active: activeId });

    this.stopSlideshow();
    this.startSlideshow();
  };

  changeSlide = () => {
    if (this.imageHovered) {
      return;
    }

    let newActive = this.state.active;
    if (newActive === this.length - 1) {
      newActive = 0;
    } else {
      ++newActive;
    }

    this.setState({ sliding: true });
    setTimeout(() => {
      this.panel.to(newActive);
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

  onImageMouseOver = () => {
    this.imageHovered = true;
  };

  onImageMouseOut = () => {
    this.imageHovered = false;
  };

  render() {
    const { quotes } = this.props;

    if (!quotes || quotes.isEmpty()) {
      return null;
    }

    this.length = quotes.size;
    let preparedQuotes;
    if (this.state.mobile) {
      preparedQuotes = quotes.map((q, i) => (
        <blockquote className="review" key={i}>
          <p className="review__body content">
            {q.get('text')}
          </p>
          <footer className="review__author">
            <section className="user_box">
              <img alt="" className="user_box__avatar" height="64px" src={q.get('avatar_url')} width="64px" />
              <div className="user_box__body user_box__body-flexless">
                <p className="user_box__name"><b>{q.get('first_name')} {q.get('last_name')}</b></p>
                {q.get('description') &&
                  <p className="user_box__text">
                    <a href={q.get('link')}>
                      {q.get('description')}
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

      const tabs = (
        <Tabs ref={c => this.panel = c}>
          <div>
            {quotes.map((q, i) => (
              <Tab.Content index={i} key={i}>
                <blockquote className="review">
                  <p className={reviewClassName}>
                    {q.get('text')}
                  </p>
                  <footer className="review__author">
                    <section className="user_box">
                      <div className="user_box__body">
                        <p className="user_box__name"><b>{q.get('first_name')} {q.get('last_name')}</b></p>
                        {q.get('description') &&
                          <p className="user_box__text">
                            <a href={q.get('link')}>
                              {q.get('description')}
                            </a>
                          </p>
                        }
                      </div>
                    </section>
                  </footer>
                </blockquote>
              </Tab.Content>
            ))}
          </div>
          <div className="review_group__navigation page__body width">
            {quotes.map((q, i) => (
              <Tab.Title
                activeClassName="review_group__navigation_item-active"
                className="review_group__navigation_item"
                index={i}
                key={i}
                onClick={this.clickHandler}
              >
                <img
                  alt=""
                  className="user_box__avatar review_group__navigation_pic"
                  height={this.state.active === i ? "80" : "64"}
                  src={q.get('avatar_url')}
                  width={this.state.active === i ? "80" : "64"}
                  onMouseOut={this.onImageMouseOut}
                  onMouseOver={this.onImageMouseOver}
                />
              </Tab.Title>
            ))}
          </div>
        </Tabs>
      );

      preparedQuotes = (
        <VisibilitySensor onChange={this.toggleSlideshow} onMount={this.toggleSlideshow}>
          {tabs}
        </VisibilitySensor>
      );
    }

    return (
      <div>
        <div className="page__container-bg">
          <div className="page__body page__body-rows width">
            <h2 className="page__title content-center layout__space" />
          </div>
        </div>
        <div className="review_group">
          <div className="page__body page__body-rows width">
            <div className="review_group__reviews">
              {preparedQuotes}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
