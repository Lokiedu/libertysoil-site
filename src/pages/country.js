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
import { connect } from 'react-redux';

import ApiClient from '../api/client'
import { API_HOST } from '../config';
import { addCountry, setCountryPosts } from '../actions';

import Header from '../components/header';
import NotFound from '../pages/not-found';
import Footer from '../components/footer';
import River from '../components/river_of_posts';
import Sidebar from '../components/sidebar'
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';


export class CountryPage extends Component {
  static propTypes = {
    geo: PropTypes.shape({
      countries: PropTypes.shape.isRequired
    }),
    params: PropTypes.shape({
      country: PropTypes.string.isRequired
    })
  };

  static async fetchData(params, store, client) {
    let country = await client.country(params.country);
    store.dispatch(addCountry(country));

    let countryPosts = client.countryPosts(country.iso_alpha2);
    store.dispatch(setCountryPosts(country.iso_alpha2, await countryPosts));
  }

  render() {
    const {
      is_logged_in,
      current_user,
      posts,
      geo,
      users
    } = this.props;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    let thisCountry = {
      name: ''
    };

    if(this.props.params.country in geo.countries) {
      thisCountry = geo.countries[this.props.params.country];
    } else {
      return (
        <NotFound />
      );
    }

    let thisCountryPosts = [];

    if(geo && geo.countryPosts && this.props.params.country in geo.countryPosts) {
      thisCountryPosts = geo.countryPosts[this.props.params.country];
    }

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user} />

        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={current_user} />

            <div className="page__body_content">
              <div className="tag_header">
                {thisCountry.name}
              </div>

              <div className="page__content page__content-spacing">
                <River river={thisCountryPosts} posts={posts} users={users} current_user={current_user} triggers={triggers}/>
                {/*<Followed/> */}
                {/*<Tags/>*/}
              </div>
            </div>
          </div>
        </div>

        <Footer/>
      </div>
    )
  }
}

export default connect(defaultSelector)(CountryPage);
