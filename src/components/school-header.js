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
import React, { PropTypes } from 'react';

//import FollowButton from './follow-button';
import moment from 'moment';
import FollowTagButton from './follow-tag-button';
import LikeTagButton from './like-tag-button';
//import { getUrl, URL_NAMES } from '../utils/urlGenerator';


export default class SchoolHeader extends React.Component {
  static displayName = 'SchoolHeader';

  static propTypes = {
    is_logged_in: PropTypes.bool.isRequired,
    school: PropTypes.shape({
      id: PropTypes.string.isRequired,
      url_name: PropTypes.string.isRequired
    }),
    triggers: PropTypes.shape({
      followSchool: PropTypes.func.isRequired,
      unfollowSchool: PropTypes.func.isRequired,
      likeSchool: PropTypes.func.isRequired,
      unlikeSchool: PropTypes.func.isRequired
    })
  };

  render () {
    const { 
      school, 
      current_user,
      triggers,
      is_logged_in
      /*
      i_am_following,
      following,
      followers 
      */
    } = this.props;
    
    let name = school.url_name;
    let updated_at = moment(school.updated_at).format('MMMM D, HH:MM');
    /*
    let followingCount;
    let followersCount;
    */
    if (school.name) {
      name = school.name;
    }

    /*
    if (following && following[school.id]) {
      if (current_user.id != school.id) {
        followingCount = (
          <div>
            {following[school.id].length}<br />
            Following
          </div>
        );
      } else {
        followingCount = (
          <div>
            {following[school.id].length}<br />
            <Link to={getUrl(URL_NAMES.MANAGE_FOLLOWERS)}>Following</Link>
          </div>
        );
      }
    }
    if (followers && followers[school.id]) {
      if (current_user.id != school.id) {
        followersCount = (
          <div>
            {followers[school.id].length}<br />
            Followers
          </div>
        );
      } else {
        followersCount = (
          <div>
            {followers[school.id].length}<br />

            <Link to={getUrl(URL_NAMES.MANAGE_FOLLOWERS)}>Followers</Link>
          </div>
        );
      }

    }
    */
    name = name.trim();

    let followTriggers = {
      followTag: triggers.followSchool,
      unfollowTag: triggers.unfollowSchool
    };

    let likeTriggers = {
      likeTag: triggers.likeSchool,
      unlikeTag: triggers.unlikeSchool
    };

    return (
      <div className="profile">
        <div className="profile__body">
          <div className="layout__row">
            <div className="layout__grid_item layout__grid_item-wide">
              <div className="profile__title">{name}</div>
              <div className="profile__updated_at">{updated_at}</div>
            </div>
            <div className="layout__grid layout-align_vertical">
              <div className="layout__grid_item layout__grid_item-wide">
                <LikeTagButton
                  is_logged_in={is_logged_in}
                  liked_tags={current_user.liked_schools}
                  tag={school.url_name}
                  triggers={likeTriggers}
                />
              </div>
              <div className="layout__grid_item layout__grid_item-small">
                <FollowTagButton
                  current_user={current_user}
                  followed_tags={current_user ? current_user.followed_schools : {}}
                  tag={school.url_name}
                  triggers={followTriggers}
                />
              </div>
              {/*
              <div className="layout__grid_item">
                {followingCount}
              </div>
              <div className="layout__grid_item">
                {followersCount}
              </div>
              <div className="layout__grid_item">
                <FollowButton active_school={current_user} school={school} following={i_am_following} triggers={this.props.triggers} />
              </div>
              */}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
