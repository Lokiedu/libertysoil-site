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
import { Link, IndexLink } from 'react-router';

import Panel from './panel';
import Time from './time';
import FollowTagButton from './follow-tag-button';
import Tag from './tag';
import LikeTagButton from './like-tag-button';
import TagDescription from './tag-description';
import { TAG_SCHOOL, TAG_LOCATION, TAG_HASHTAG } from '../consts/tags';


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

function getTagPrefix(type) {
  switch (type) {
    case TAG_SCHOOL:
      return 's';
    case TAG_HASHTAG:
      return 'tag';
    case TAG_LOCATION:
      return 'geo';
    default:
      return '';
  }
}

const TagHeader = (props) => {
  const {
    tag,
    type,
    current_user,
    newPost,
    triggers = {},
    is_logged_in,
    postsAmount
  } = props;

  let toolbarPrimary = [];
  let toolbarSecondary = [];
  let toolbarAlt = [];

  const prefix = getTagPrefix(type);

  let name = tag.url_name;
  if (tag.name) {
    name = tag.name.trim();
  }

  let url_name = tag.name;
  if (tag.url_name) {
    url_name = tag.url_name;
  }

  const description = tag.description || (tag.more && tag.more.description);

  if (is_logged_in) {
    const followTriggers = getFollowTriggers(triggers, type);
    const likeTriggers = getLikeTriggers(triggers, type);

    toolbarSecondary = [
      <LikeTagButton
        is_logged_in={is_logged_in}
        key="like"
        liked_tags={getLikedTags(current_user, type)}
        outline
        size="midl"
        tag={url_name}
        triggers={likeTriggers}
      />
    ];

    toolbarPrimary = [
      <button className="button button-midi button-light_blue" key="new" type="button" onClick={newPost}>New</button>,
      <FollowTagButton
        className="button-midi"
        current_user={current_user}
        followed_tags={current_user ? getFollowedTags(current_user, type) : {}}
        key="follow"
        tag={url_name}
        triggers={followTriggers}
      />
    ];

    toolbarAlt = [
      <IndexLink
        activeClassName="tabs__title-active"
        className="tabs__title tabs__title-gray button button-midi"
        key="toPosts"
        to={`/${prefix}/${url_name}`}
      >
        Posts
      </IndexLink>,
      <Link
        activeClassName="tabs__title-active"
        className="tabs__title tabs__title-gray button button-midi"
        key="toEdit"
        to={`/${prefix}/${url_name}/edit`}
        visible
      >
        Edit
      </Link>
    ];

    if (postsAmount) {
      let postsWordForm = 'post';
      if (postsAmount > 1) {
        postsWordForm += 's';
      }

      toolbarPrimary.unshift(
        <div className="panel__toolbar_item-text" key="posts">
          {postsAmount} {postsWordForm}
        </div>
      );
    }
  }

  return (
    <Panel
      icon={<Tag size="BIG" type={type} urlId={url_name} />}
      title={name}
      toolbarAlt={toolbarAlt}
      toolbarPrimary={toolbarPrimary}
      toolbarSecondary={toolbarSecondary}
    >
      <TagDescription description={description} />
      {tag.updated_at &&
        <p><Time timestamp={tag.updated_at} /></p>
      }
    </Panel>
  );
};

TagHeader.displayName = 'TagHeader';

TagHeader.propTypes = {
  current_user: PropTypes.shape({}),
  is_logged_in: PropTypes.bool.isRequired,
  newPost: PropTypes.func,
  postsAmount: PropTypes.number,
  tag: PropTypes.shape({
    name: PropTypes.string
  }).isRequired,
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
  }),
  type: PropTypes.string.isRequired
};

export default TagHeader;
