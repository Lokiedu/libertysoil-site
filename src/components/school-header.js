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

import Panel from './panel';
import Time from './time';
import FollowTagButton from './follow-tag-button';
import Tag from './tag';
import LikeTagButton from './like-tag-button';
import { TAG_SCHOOL }   from '../consts/tags';
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
      triggers = {},
      is_logged_in
    } = this.props;

    let toolbarPrimary = [];
    let toolbarSecondary = [];

    let name = school.url_name;
    let linesOfDescription = <p>No information provided...</p>;

    if (school.name) {
      name = school.name;
    }

    name = name.trim();

    if (school.description) {
      linesOfDescription = school.description.split("\n").map((line, i) => <p key={`school-${i}`}>{line}</p>);
    }

    let followTriggers = {
      followTag: triggers.followSchool,
      unfollowTag: triggers.unfollowSchool
    };

    let likeTriggers = {
      likeTag: triggers.likeSchool,
      unlikeTag: triggers.unlikeSchool
    };

    if (is_logged_in) {
      toolbarSecondary = [
        <LikeTagButton
          is_logged_in={is_logged_in}
          liked_tags={current_user.liked_schools}
          tag={school.url_name}
          triggers={likeTriggers}
          outline={true}
          size="midl"
        />
      ];

      toolbarPrimary = [
        /*<div key="posts" className="panel__toolbar_item-text">
          {tagPosts.length} posts
        </div>,*/
        <button key="new" className="button button-midi button-light_blue" type="button">New</button>,
        <FollowTagButton
          current_user={current_user}
          followed_tags={current_user ? current_user.followed_schools : {}}
          tag={school.url_name}
          triggers={followTriggers}
          className="button-midi"
        />
      ];
    }

    return (
      <Panel
        title={name}
        icon={<Tag size="BIG" type={TAG_SCHOOL} urlId={school.url_name} />}
        toolbarPrimary={toolbarPrimary}
        toolbarSecondary={toolbarSecondary}
      >
        {linesOfDescription}
        <p><Time timestamp={school.updated_at} /></p>
      </Panel>
    )
  }
}
