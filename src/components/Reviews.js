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
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import { throttle } from 'lodash';

import albert_einstein from '../images/quotes/albert_einstein.jpg';
import anne_frank from '../images/quotes/anne_frank.jpg';
import as_neill from '../images/quotes/as_neill.jpg';
import benazir_bhutto from '../images/quotes/benazir_bhutto.jpg';
import eric_berne from '../images/quotes/eric_berne.jpg';
import george_callin from '../images/quotes/george_callin.jpg';
import jean_piaget from '../images/quotes/jean_piaget.jpg';
import katharine_hepburn from '../images/quotes/katharine_hepburn.jpg';
import ken_robinson from '../images/quotes/ken_robinson.jpg';
import mahatma_gandhi from '../images/quotes/mahatma_gandhi.jpg';
import malala_yousafzai from '../images/quotes/malala_yousafzai.jpg';
import marie_curie from '../images/quotes/marie_curie.jpg';
import maya_angelou from '../images/quotes/maya_angelou.jpg';
import michelle_obama from '../images/quotes/michelle_obama.jpg';
import nelson_mandela from '../images/quotes/nelson_mandela.jpg';
import richard_branson from '../images/quotes/richard_branson.jpg';
import rosa_parks from '../images/quotes/rosa_parks.jpg';
import steve_jobs from '../images/quotes/steve_jobs.jpg';
import sugata_mitra from '../images/quotes/sugata_mitra.jpg';
import zoe_weil from '../images/quotes/zoe_weil.jpg';

import { Tab, Tabs } from './tabs';
import VisibilitySensor from './visibility-sensor';


const avatars = {
  albert_einstein,
  anne_frank,
  as_neill,
  benazir_bhutto,
  eric_berne,
  george_callin,
  jean_piaget,
  katharine_hepburn,
  ken_robinson,
  mahatma_gandhi,
  malala_yousafzai,
  marie_curie,
  maya_angelou,
  michelle_obama,
  nelson_mandela,
  richard_branson,
  rosa_parks,
  steve_jobs,
  sugata_mitra,
  zoe_weil,
};

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

  avatarUrlRe = /\/images\/quotes\/(.+)\.jpg/;

  fixAvatarUrl = (dbUrl) => {
    const name = dbUrl.replace(this.avatarUrlRe, '$1');
    return avatars[name];
  };

  render() {
    const { quotes } = this.props;

    if (!quotes || quotes.isEmpty()) {
      return null;
    }

    this.length = quotes.size;
    let preparedQuotes;
    if (this.state.mobile) {
      preparedQuotes = quotes.map((q, i) => {
        const avatarUrl = this.fixAvatarUrl(q.get('avatar_url'));

        return (
          <blockquote className="review" key={i}>
            <p className="review__body content">
              {q.get('text')}
            </p>
            <footer className="review__author">
              <section className="user_box">
                <img alt="" className="user_box__avatar" height="64px" src={avatarUrl} width="64px" />
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
        );
      });
    } else {
      let reviewClassName = 'review__body content';
      if (this.state.sliding) {
        reviewClassName += ' review__body-sliding';
      }

      const tabs = (
        <Tabs ref={c => this.panel = c}>
          <div>
            {quotes.map((q, i) => {
              return (
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
              );
            })}
          </div>
          <div className="review_group__navigation page__body width">
            {quotes.map((q, i) => {
              const avatarUrl = this.fixAvatarUrl(q.get('avatar_url'));

              return (
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
                    src={avatarUrl}
                    width={this.state.active === i ? "80" : "64"}
                    onMouseOut={this.onImageMouseOut}
                    onMouseOver={this.onImageMouseOver}
                  />
                </Tab.Title>
              );
            })}
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
