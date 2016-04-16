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
import React, { PropTypes } from 'react';

import Panel from '../panel';
import Time from '../time';
import FollowTagButton from '../follow-tag-button';
import Tag from '../tag';
import LikeTagButton from '../like-tag-button';
import { TAG_SCHOOL, TAG_LOCATION, TAG_HASHTAG } from '../../consts/tags';

function getLikeTriggers(triggers, type) {
  switch (type) {
    case TAG_SCHOOL:
      return { likeTag: triggers.likeSchool, unlikeTag: triggers.unlikeSchool };
    case TAG_HASHTAG:
      return { likeTag: triggers.likeHashtag, unlikeTag: triggers.unlikeHashtag };
    case TAG_LOCATION:
      return { likeTag: triggers.likeGeotag, unlikeTag: triggers.unlikeGeotag };
    default:
      return {};
  }
}

function getLikedTags(user, type) {
  switch (type) {
    case TAG_SCHOOL:
      return user.liked_schools;
    case TAG_HASHTAG:
      return user.liked_hashtags;
    case TAG_LOCATION:
      return user.liked_geotags;
    default:
      return {};
  }
}

function getFollowTriggers(triggers, type) {
  switch (type) {
    case TAG_SCHOOL:
      return { followTag: triggers.followSchool, unfollowTag: triggers.unfollowSchool };
    case TAG_HASHTAG:
      return { followTag: triggers.followTag, unfollowTag: triggers.unfollowTag };
    case TAG_LOCATION:
      return { followTag: triggers.followGeotag, unfollowTag: triggers.unfollowGeotag };
    default:
      return {};
  }
}

function getFollowedTags(user, type) {
  switch (type) {
    case TAG_SCHOOL:
      return user.followed_schools;
    case TAG_HASHTAG:
      return user.followed_hashtags;
    case TAG_LOCATION:
      return user.followed_geotags;
    default:
      return {};
  }
}

export default class TagHeader extends React.Component {
  static displayName = 'TagHeader';

  static propTypes = {
    is_logged_in: PropTypes.bool.isRequired,
    tag: PropTypes.shape({
      name: PropTypes.string
    }).isRequired,
    type: PropTypes.string.isRequired,
    triggers: PropTypes.shape({
      followSchool: PropTypes.func,
      unfollowSchool: PropTypes.func,
      likeSchool: PropTypes.func,
      unlikeSchool: PropTypes.func,
      followTag: PropTypes.func,
      unfollowTag: PropTypes.func,
      likeHashtag: PropTypes.func,
      unlikeHashtag: PropTypes.func,
      followGeotag: PropTypes.func,
      unfollowGeotag: PropTypes.func,
      likeGeotag: PropTypes.func,
      unlikeGeotag: PropTypes.func
    }).isRequired
  };

  render() {
    const {
      tag,
      type,
      current_user,
      triggers = {},
      is_logged_in,
      postsAmount
    } = this.props;

    let toolbarPrimary = [];
    let toolbarSecondary = [];

    let name = tag.url_name;
    if (tag.name) {
      name = tag.name.trim();
    }

    let url_name = tag.name;
    if (tag.url_name) {
      url_name = tag.url_name;
    }

    let linesOfDescription = <p>No information provided...</p>;
    if (tag.description) {
      linesOfDescription = tag.description.split("\n").map((line, i) => <p key={`tag-${i}`}>{line}</p>);
    }

    if (is_logged_in) {
      const followTriggers = getFollowTriggers(triggers, type);
      const likeTriggers = getLikeTriggers(triggers, type);

      toolbarSecondary = [
        <LikeTagButton
          is_logged_in={is_logged_in}
          liked_tags={getLikedTags(current_user, type)}
          tag={url_name}
          triggers={likeTriggers}
          outline={true}
          size="midl"
        />
      ];

      toolbarPrimary = [
        <button key="new" onClick={this.props.newPost} className="button button-midi button-light_blue" type="button">New</button>,
        <FollowTagButton
          current_user={current_user}
          followed_tags={current_user ? getFollowedTags(current_user, type) : {}}
          tag={url_name}
          triggers={followTriggers}
          className="button-midi"
        />
      ];

      if (postsAmount) {
        toolbarPrimary.unshift(
          <div key="posts" className="panel__toolbar_item-text">
            {postsAmount} posts
          </div>
        );
      }
    }

    return (
      <Panel
        title={name}
        icon={<Tag size="BIG" type={type} urlId={url_name} />}
        toolbarPrimary={toolbarPrimary}
        toolbarSecondary={toolbarSecondary}
      >
        {linesOfDescription}
        {tag.updated_at &&
          <p><Time timestamp={tag.updated_at} /></p>
        }
      </Panel>
    );
  }
}
