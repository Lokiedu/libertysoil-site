import React from 'react';
import {Link} from 'react-router';

import Header from '../components/header';
import Footer from '../components/footer';
import User from '../components/current_user';
import River from '../components/river_of_posts';
import Followed from '../components/most_followed_people';
import Tags from '../components/popular_tags';

export default class Index extends React.Component {
  render() {
    let currentUser = {
      username: 'johndoe',
      userpic: 'http://api.randomuser.me/portraits/thumb/women/39.jpg',
      firstName: 'John',
      lastName: 'Doe',
      profileURI: 'http://example.com/'
    };

    return (
      <div>
        <Header currentUser={currentUser} />
        <Link to="/auth">go to auth</Link>
        <User currentUser={currentUser} />
        <hr/>
        <p>This is a List-page</p>
        <hr/>
        <River/>
        <Followed/>
        <Tags/>
        <Footer/>
      </div>
    )
  }
}
