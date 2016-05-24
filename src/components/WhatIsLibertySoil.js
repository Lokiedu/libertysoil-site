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

import { Tab, Tabs } from './tabs';

const backpackImg = '/images/welcome/backpack.jpg';
const baloonImg = '/images/welcome/balloon.jpg';
const curiosityImg = '/images/welcome/curiosity.png';
const dataImg = '/images/welcome/data.jpg';
const suppliesImg = '/images/welcome/supplies.jpg';
const telescopeImg = '/images/welcome/telescope.png';

const titles = [
  { text: 'Why join LibertySoil:', delim: ' ' },
  { text: 'Children', delim: ', ' },
  { text: 'Parents', delim: ', ' },
  { text: 'Teachers', delim: ', ' },
  { text: 'Schools', delim: ' ' }
];

const tabs = [
  {
    text: [
      "In today's world we have more resources, methods, techniques and opportunities available for learning than ever before in human history.",
      "Let’s not waste or hide these valuable experiences, thoughts and ideas and collect them here for future generations to see, evaluate and learn from our collective experience.",
      "Share your own story or send us your feedback, thoughts and ideas anytime in any form and any language, we will figure it out."
    ],
    image: telescopeImg,
    linktext: "Start your collection",
    reverse: false
  },
  {
    text: [
      "Education focused network is a great way to connect with other students, share experiences, knowledge and support others by sharing your life story.",
      "You could explore different career opportunities, student exchange programs and  connect with like-minded people around the world."
    ],
    image: backpackImg,
    linktext: "Create new profile",
    reverse: true
  },
  {
    text: [
      "Learn about progressive, humane ways to educate your children and improve your family life.",
      "Find solutions for common school issues, such as bullying and child depression.",
      "Become an active, informed advocate of your child’s best interest. Collaborate with other parents, share your story."
    ],
    image: baloonImg,
    linktext: "Create profile",
    reverse: true
  },
  {
    text: [
      "Teachers have a unique experience of applying theory into practice, testing how new ideas and reforms work in reality. You could share your concerns and discuss those with the global education community.",
      "Learn about features and methods used in different schools around the world, exchange experience and collaborate internationally."
    ],
    image: suppliesImg,
    linktext: "Create profile",
    reverse: false
  },
  {
    text: [
      "Schools could communicate and improve, exchange experiences with other communities and organisations around the world, support school start-up groups that lack the experience to handle challenging situations."
    ],
    image: dataImg,
    linktext: "Create profile",
    reverse: false
  },
  {
    text: [
      "Join the education change network to learn about different approaches to learning from around the world.",
      "Share your ideas, give feedback, help us all see the issue of education from different perspectives.",
      "Volunteer and help the community grow."
    ],
    image: curiosityImg,
    linktext: "Create profile",
    reverse: false
  }
];

const WhatIsLibertySoil = () => (
  <div>
    <Tabs>
      <section className="landing">
        <header className="landing__header">
          <h2 className="landing__subtitle">Resources, perspectives, experience</h2>
          {titles.map((title, i) => (
            <span key={i}>
              <Tab.Title activeClassName="highlight" className="link" index={i}>
                {title.text}
              </Tab.Title>
              {title.delim}
            </span>
          ))}
          <span>
            and the <Tab.Title activeClassName="highlight" className="link" index={titles.length}>Society</Tab.Title>?
          </span>
        </header>
      </section>
      <div className="page__body page__body-rows">
        <div className="layout__grid_wrapper">
          {tabs.map((tab, index) => {
            let cn = 'layout layout-align_center layout-align_vertical layout__grid layout__grid-responsive';
            if (tab.reverse) {
              cn += ' layout__grid-row_reverse';
            }

            return (
              <Tab.Content index={index} key={index}>
                <div className={cn}>
                  <div className="layout__grid_item layout__grid_item-identical">
                    <div className="void content">
                      {tab.text.map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                      <p><a href="/auth#register">{tab.linktext}</a></p>
                    </div>
                  </div>
                  <div className="layout__grid_item layout__grid_item-identical">
                    <div className="void">
                      <img height="300" src={tab.image} width="400"/>
                    </div>
                  </div>
                </div>
              </Tab.Content>
            );
          })}
        </div>
      </div>
    </Tabs>
  </div>
);

WhatIsLibertySoil.displayName = 'WhatIsLibertySoil';

export default WhatIsLibertySoil;
