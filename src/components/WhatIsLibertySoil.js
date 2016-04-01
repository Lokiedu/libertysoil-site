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

export default class WhatIsLibertySoil extends Component {
  constructor (props) {
    super(props);

    this.state = {
      activeSlide: 0
    };
  }

  changeSlide (slideId) {
    this.setState({
      activeSlide: slideId
    });
  }

  render () {
    var activeSlide = this.state.activeSlide;
    var navigation;

    switch (activeSlide) {
      case 0:
        navigation = <p>
          <span className="highlight">Why join LibertySoil:</span>&nbsp;<span className="link" onClick={this.changeSlide.bind(this, 1)}>Children</span>, <span className="link" onClick={this.changeSlide.bind(this, 2)}>Parents</span>, <span className="link" onClick={this.changeSlide.bind(this, 3)}>Teachers</span>, <span className="link" onClick={this.changeSlide.bind(this, 4)}>Schools</span> and the <span className="link" onClick={this.changeSlide.bind(this, 5)}>Society</span>?
        </p>;
        break;

      case 1:
        navigation = <p>
          <span className="link" onClick={this.changeSlide.bind(this, 0)}>Why join LibertySoil:</span>&nbsp;<span className="highlight">Children</span>, <span className="link" onClick={this.changeSlide.bind(this, 2)}>Parents</span>, <span className="link" onClick={this.changeSlide.bind(this, 3)}>Teachers</span>, <span className="link" onClick={this.changeSlide.bind(this, 4)}>Schools</span> and the <span className="link" onClick={this.changeSlide.bind(this, 5)}>Society</span>?
        </p>;
        break;

      case 2:
        navigation = <p>
          <span className="link" onClick={this.changeSlide.bind(this, 0)}>Why join LibertySoil:</span>&nbsp;<span className="link" onClick={this.changeSlide.bind(this, 1)}>Children</span>, <span className="highlight">Parents</span>, <span className="link" onClick={this.changeSlide.bind(this, 3)}>Teachers</span>, <span className="link" onClick={this.changeSlide.bind(this, 4)}>Schools</span> and the <span className="link" onClick={this.changeSlide.bind(this, 5)}>Society</span>?
        </p>;
        break;


      case 3:
        navigation = <p>
          <span className="link" onClick={this.changeSlide.bind(this, 0)}>Why join LibertySoil:</span>&nbsp;<span className="link" onClick={this.changeSlide.bind(this, 1)}>Children</span>, <span className="link" onClick={this.changeSlide.bind(this, 2)}>Parents</span>, <span className="highlight">Teachers</span>, <span className="link" onClick={this.changeSlide.bind(this, 4)}>Schools</span> and the <span className="link" onClick={this.changeSlide.bind(this, 5)}>Society</span>?
        </p>;
        break;

      case 4:
        navigation = <p>
          <span className="link" onClick={this.changeSlide.bind(this, 0)}>Why join LibertySoil:</span>&nbsp;<span className="link" onClick={this.changeSlide.bind(this, 1)}>Children</span>, <span className="link" onClick={this.changeSlide.bind(this, 2)}>Parents</span>, <span className="link" onClick={this.changeSlide.bind(this, 3)}>Teachers</span>, <span className="highlight">Schools</span> and the <span className="link" onClick={this.changeSlide.bind(this, 5)}>Society</span>?
        </p>;
        break;

      case 5:
        navigation = <p>
          <span className="link" onClick={this.changeSlide.bind(this, 0)}>Why join LibertySoil:</span>&nbsp;<span className="link" onClick={this.changeSlide.bind(this, 1)}>Children</span>, <span className="link" onClick={this.changeSlide.bind(this, 2)}>Parents</span>, <span className="link" onClick={this.changeSlide.bind(this, 3)}>Teachers</span>, <span className="link" onClick={this.changeSlide.bind(this, 4)}>Schools</span> and the <span className="highlight">Society</span>?
        </p>;
        break;
    }

    return (<div>
        <section className="landing">
          <header className="landing__header">
            <h2 className="landing__subtitle">Resources, perspectives, experience</h2>
            {navigation}
          </header>
        </section>
        <div className="page__body page__body-rows">
          <div className="layout__grid_wrapper">
            {activeSlide == 0 && <div className="layout layout-align_center layout-align_vertical layout__grid layout__grid-responsive">
              <div className="layout__grid_item layout__grid_item-identical">
                <div className="void content">
                  <p>In today's world we have more resources, methods, techniques and opportunities available for learning than ever before in human history.</p>
                  <p>Let’s not waste or hide these valuable experiences, thoughts and ideas and collect them here for future generations to see, evaluate and learn from our collective experience.</p>
                  <p>Share your own story or send us your feedback, thoughts and ideas anytime in any form and any language, we will figure it out.</p>
                  <p><a href="#">Start your collection</a></p>
                </div>
              </div>
              <div className="layout__grid_item layout__grid_item-identical">
                <div className="void">
                  <img width="400" height="300" src={require('../images/welcome/telescope.png')} />
                </div>
              </div>
            </div>}
            {activeSlide == 1 && <div className="layout layout-align_center layout-align_vertical layout__grid layout__grid-responsive">
              <div className="layout__grid_item layout__grid_item-identical">
                <div className="void">
                  <img src={require('../images/welcome/backpack.jpg')} width="400" height="300" />
                </div>
              </div>
              <div className="layout__grid_item layout__grid_item-identical">
                <div className="void content">
                    <p>Education focused network is a great way to connect with other students, share experiences, knowledge and support others by sharing your life story.</p>
                    <p>You could explore different career opportunities, student exchange programs and  connect with like-minded people around the world.</p>
                    <p><a href="/auth">Create new profile</a></p>
                  </div>
              </div>
            </div>}

            {activeSlide == 2 && <div className="layout layout-align_center layout-align_vertical layout__grid layout__grid-responsive">
              <div className="layout__grid_item layout__grid_item-identical">
                <div className="void">
                  <img src={require('../images/welcome/balloon.jpg')} width="400" height="300" />
                </div>
              </div>
              <div className="layout__grid_item layout__grid_item-identical">
                <div className="void content">
                  <p>Learn about progressive, humane ways to educate your children and improve your family life.</p>
                  <p>Find solutions for common school issues, such as bullying and child depression. </p>
                  <p>Become an active, informed advocate of your child’s best interest. Collaborate with other parents, share your story.</p>
                  <p><a href="/auth">Create profile</a></p>
                </div>
              </div>
            </div>}

            {activeSlide == 3 && <div className="layout layout-align_center layout-align_vertical layout__grid layout__grid-responsive">
              <div className="layout__grid_item layout__grid_item-identical">
                <div className="void content">
                  <p>Teachers have a unique experience of applying theory into practice, testing how new ideas and reforms work in reality. You could share your concerns and discuss those with the global education community.</p>
                  <p>Learn about features and methods used in different schools around the world, exchange experience and collaborate internationally.</p>
                  <p><a href="#">Create profile</a></p>
                </div>
              </div>
              <div className="layout__grid_item layout__grid_item-identical">
                <div className="void">
                  <img src={require('../images/welcome/supplies.jpg')} width="400" height="300" />
                </div>
              </div>
            </div>}

            {activeSlide == 4 && <div className="layout layout-align_center layout-align_vertical layout__grid layout__grid-responsive">
              <div className="layout__grid_item layout__grid_item-identical">
                <div className="void content">
                  <p>Schools could communicate and improve, exchange experiences with other communities and organisations around the world, support school start-up groups that lack the experience to handle challenging situations.</p>
                  <p></p>
                  <p><a href="#">Create profile</a></p>
                </div>
              </div>
              <div className="layout__grid_item layout__grid_item-identical">
                <div className="void">
                  <img src={require('../images/welcome/data.jpg')} width="400" height="300" />
                </div>
              </div>
            </div>}

            {activeSlide == 5 && <div className="layout layout-align_center layout-align_vertical layout__grid layout__grid-responsive">
              <div className="layout__grid_item layout__grid_item-identical">
                <div className="void content">
                  <p>Join the education change network to learn about different approaches to learning from around the world.</p>
                   <p>Share your ideas, give feedback, help us all see the issue of education from different perspectives.</p>
                   <p>Volunteer and help the community grow.</p>
                  <p><a href="#">Create profile</a></p>
                </div>
              </div>
              <div className="layout__grid_item layout__grid_item-identical">
                <div className="void">
                  <img src={require('../images/welcome/curiosity.png')} width="400" height="300" />
                </div>
              </div>
            </div>}

          </div>
        </div>
    </div>)
  }
}
