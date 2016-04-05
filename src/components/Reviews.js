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
import React, { Component, PropTypes } from 'react';
import { throttle } from 'lodash';

import { Tabs, Tab, TabTitle, TabContent } from './tabs';

export default class Reviews extends Component {
  static propTypes = {
    quotes: PropTypes.array
  };

  state = {
    mobile: true
  };

  clientWidth = 0;

  componentDidMount() {
    window.addEventListener('resize', this.toggleMode);
    document.addEventListener('DOMContentLoaded', this.toggleMode);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.toggleMode);
    document.removeEventListener('DOMContentLoaded', this.toggleMode);
  }

  toggleMode = throttle(() => {
    const breakpointWidth = 1024;
    const clientWidth = document.body.clientWidth;

    if (clientWidth === this.clientWidth) {
      return;
    }

    if (clientWidth >= breakpointWidth) {
      this.setState({ mobile: false })
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
    const quotes = [
      {
        author: {
          name: "Zoe",
          surname: "Weil",
          avatar_url: '/images/quotes/zoe_weil.jpg'
        },
        body: "Someday, I hope that we will all be patriots of our planet and not just of our respective nations.",
        description: {
          text: "Most Good, Least Harm: A Simple Principle for a Better World and Meaningful Life",
          link: "http://humaneeducation.org/blog/resource/most-good-least-harm-a-simple-principle-for-a-better-world-and-meaningful-life/"
        }
      },
      {
        author: {
          name: "A.S.",
          surname: "Neill",
          avatar_url: '/images/quotes/as_neill.jpg'
        },
        body: "A few generations ago youth accepted it's lower status, accepted the directions of the fathers and their symbols. Today youth rebels but in a futile way. Its weird haircuts, its leather jackets, its blue jeans, its motor bikes are all symbols of rebellion but symbols that remain symbols. In essentials youth is still docile, obedient, inferior: it challenges the things that do not matter - clothes, manners, hairstyles.",
        description: {
          text: "Scottish educator and author, founder of Summerhill School",
          link: "https://en.wikipedia.org/wiki/A._S._Neill Math teacher"
        }
      },
      {
        author: {
          name: "Ken",
          surname: "Robinson",
          avatar_url: '/images/quotes/ken_robinson.jpg'
        },
        body: "We have sold ourselves into a fast food model of education, and it''s impoverishing our spirit and our energies as much as fast food is depleting our physical bodies.",
        description: {
          text: "The Element: How Finding Your Passion Changes Everything",
          link: "http://sirkenrobinson.com/finding-your-element/"
        }
      },
      {
        author: {
          name: 'Sugata',
          surname: 'Mitra',
          avatar_url: '/images/quotes/sugata_mitra.jpg'
        },
        body: "It’s quite fashionable to say that the educational system is broken. It's not broken. It's wonderfully constructed. It's just that we don't need it anymore.",
        description: {
          text: "Professor of Educational Technology at the School of Education, Communication and Language Sciences at Newcastle University, England",
          link: 'https://en.wikipedia.org/wiki/Sugata_Mitra'
        }
      }
    ];
    //const { quotes } = this.props;

    let preparedQuotes;
    if (this.state.mobile) {
      preparedQuotes = quotes.map((q, i) => (
        <blockquote key={i} className="review">
          <p className="review__body content">
            {q.body}
          </p>
          <footer className="review__author">
            <section className="user_box">
              <img className="user_box__avatar" src={q.author.avatar_url} width="64px" height="64px" alt=""/>
              <div className="user_box__body">
                <p className="user_box__name"><b>{q.author.name} {q.author.surname}</b></p>
                { q.description.text &&
                  <p className="user_box__text">
                    <a href={q.description.link}>
                      {q.description.text}
                    </a>
                  </p>
                }
              </div>
            </section>
          </footer>
        </blockquote>
      ));
    } else {
      const tabs = quotes.map((q, i) => (
        <Tab key={i}>
          <TabTitle className="review_group__navigation_item" classNameActive="review_group__navigation_item-active">
            <img className="user_box__avatar" src={q.author.avatar_url} width="64px" height="64px" alt=""/>
          </TabTitle>
          <TabContent>
            <blockquote className="review">
              <p className="review__body content">
                {q.body}
              </p>
              <footer className="review__author">
                <section className="user_box">
                  <div className="user_box__body">
                    <p className="user_box__name"><b>{q.author.name} {q.author.surname}</b></p>
                    { q.description.text &&
                      <p className="user_box__text">
                        <a href={q.description.link}>
                          {q.description.text}
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
        <Tabs invert menuClassName="review_group__navigation page__body width">
          {tabs}
        </Tabs>
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
