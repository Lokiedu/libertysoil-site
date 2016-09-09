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
import { values, pick } from 'lodash';

import { ArrayOfSchools as ArrayOfSchoolsPropType } from '../../prop-types/schools';

import {
  Page,
  PageMain,
  PageCaption,
  PageHero,
  PageBody,
  PageContent
}                       from '../../components/page';
import Header           from '../../components/header';
import MapboxMap        from '../../components/mapbox-map';
import HeaderLogo       from '../../components/header-logo';
import CreatePost       from '../../components/create-post';
import TagBreadcrumbs   from '../../components/breadcrumbs/tag-breadcrumbs';
import Footer           from '../../components/footer';
import TagHeader        from '../../components/tag-header';
import Sidebar          from '../../components/sidebar';
import SidebarAlt       from '../../components/sidebarAlt';
import AddedTags        from '../../components/post/added-tags';
import UpdatePicture    from '../../components/update-picture/update-picture';
import { TAG_SCHOOL, TAG_LOCATION, TAG_HASHTAG } from '../../consts/tags';
import { TAG_HEADER_SIZE, DEFAULT_HEADER_PICTURE } from '../../consts/tags';

function formInitialTags(type, value) {
  switch (type) {
    case TAG_SCHOOL:
      return { schools: value };
    case TAG_HASHTAG:
      return { hashtags: value };
    case TAG_LOCATION:
      return { geotags: value };
    default:
      return {};
  }
}

function getPageCaption(type, name) {
  let caption;
  switch (type) {
    case TAG_LOCATION: {
      caption = [`${name} `, <span className="page__caption_highlight" key="caption">Education</span>];
      break;
    }
    default:
      caption = name;
  }

  return (
    <PageCaption>
      {caption}
    </PageCaption>
  );
}

function GeotagPageHero({ geotag }) {
  let type = geotag.type;
  const location = {
    lat: geotag.lat,
    lon: geotag.lon
  };

  // A lot of admin divisions don't have lat/lon. Attempt to take coords from the country.
  if (!(location.lat && location.lon) && geotag.country) {
    type = 'Country';
    location.lat = geotag.country.lat;
    location.lon = geotag.country.lon;
  }

  let zoom;
  switch (type) {
    case 'Planet': zoom = 3; break;
    case 'Continent': zoom = 4; break;
    case 'Country': zoom = 5; break;
    case 'AdminDivision1': zoom = 6; break;
    case 'City': zoom = 12; break;
    default: zoom = 10;
  }

  if (location.lat && location.lon) {
    return (
      <PageHero>
        <MapboxMap
          className="page__hero_map"
          frozen
          viewLocation={location}
          zoom={zoom}
        />
      </PageHero>
    );
  }

  return <PageHero url="/images/hero/welcome.jpg" />;
}

function TagPageHero({ type, tag, url, editable, onSubmit, limits, preview, flexible }) {
  switch (type) {
    case TAG_HASHTAG:
    case TAG_SCHOOL:
      return (
        <PageHero url={url}>
          {editable &&
            <div className="layout__grid layout-align_vertical layout-align_center layout__grid-full update_picture__container">
              <div className="layout__grid_item">
                <UpdatePicture
                  flexible={flexible}
                  limits={limits}
                  preview={preview}
                  what="header image"
                  where={(<span className="font-bold">{tag.name}</span>)}
                  onSubmit={onSubmit}
                />
              </div>
            </div>
          }
        </PageHero>
      );
    case TAG_LOCATION:
      return <GeotagPageHero geotag={tag} />;
    default:
      return null;
  }
}

export default class BaseTagPage extends React.Component {
  static displayName = 'BaseTagPage';

  static propTypes = {
    actions: PropTypes.shape({
      resetCreatePostForm: PropTypes.func,
      updateCreatePostForm: PropTypes.func
    }).isRequired,
    children: PropTypes.node,
    postsAmount: PropTypes.number,
    schools: ArrayOfSchoolsPropType.isRequired,
    tag: PropTypes.shape({}).isRequired,
    type: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.postsAmount = null;
    this.state = {
      form: false,
      head_pic: null
    };
  }

  componentWillMount() {
    this.postsAmount = this.props.postsAmount;
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.form) {
      if (this.postsAmount != nextProps.postsAmount) {
        this.setState({ form: false });
      }
    }

    this.postsAmount = nextProps.postsAmount;
  }

  componentWillUnmount() {
    this.props.actions.resetCreatePostForm();
  }

  _getNewPictures() {
    const pictures = {};

    if (this.state.head_pic) {
      pictures.head_pic = this.state.head_pic.production;
    }

    return pictures;
  }

  _clearPreview() {
    this.setState({ head_pic: null });
  }

  addPicture = async ({ production, preview }) => {
    if (production) {
      const _production = { picture: production.picture };

      // properties assign order is important
      _production.crop = pick(production.crop, ['left', 'top', 'right', 'bottom']);

      if (production.crop.width > TAG_HEADER_SIZE.BIG.width) {
        _production.scale = { wRatio: TAG_HEADER_SIZE.BIG.width / production.crop.width };
      } else {
        _production.scale = { wRatio: TAG_HEADER_SIZE.NORMAL.width / production.crop.width };
      }

      this.setState({ head_pic: { production: _production, preview } });
    } else {
      this.setState({ head_pic: null });
    }
  };

  toggleForm = () => {
    if (!this.state.form) {
      const { tag, type } = this.props;
      this.props.actions.resetCreatePostForm();
      this.props.actions.updateCreatePostForm(formInitialTags(type, [tag]));
    }

    this.setState({ form: !this.state.form });
  };

  render() {
    const {
      is_logged_in,
      current_user,
      actions,
      triggers,
      type,
      tag,
      postsAmount,
      editable
    } = this.props;

    let name = tag.url_name;
    if (tag.name) {
      name = tag.name;
    }

    const pageCaption = getPageCaption(type, name);

    let headerPictureUrl;
    if (this.state.head_pic) {
      headerPictureUrl = this.state.head_pic.preview.url;
    } else if (this.props.tag.more && this.props.tag.more.head_pic) {
      headerPictureUrl = this.props.tag.more.head_pic.url;
    } else {
      headerPictureUrl = DEFAULT_HEADER_PICTURE;
    }

    let createPostForm;
    let addedTags;
    if (is_logged_in) {
      if (this.state.form) {
        createPostForm = (
          <CreatePost
            actions={actions}
            allSchools={values(this.props.schools)}
            defaultText={this.props.create_post_form.text}
            triggers={triggers}
            userRecentTags={current_user.recent_tags}
            {...this.props.create_post_form}
          />
        );
        addedTags = <AddedTags {...this.props.create_post_form} />;
      }
    }

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user}>
          <HeaderLogo small />
          <TagBreadcrumbs type={type} tag={tag} />
        </Header>

        <Page>
          <Sidebar current_user={current_user} />
          <PageMain className="page__main-no_space">
            {pageCaption}
            <TagPageHero
              editable={editable}
              flexible
              limits={{ min: TAG_HEADER_SIZE.MIN, max: TAG_HEADER_SIZE.BIG }}
              preview={TAG_HEADER_SIZE.PREVIEW}
              tag={tag}
              type={type}
              url={headerPictureUrl}
              onSubmit={this.addPicture}
            />
            <PageBody className="page__body-up">
              <TagHeader
                current_user={current_user}
                editable={editable}
                is_logged_in={is_logged_in}
                newPost={this.toggleForm}
                postsAmount={postsAmount}
                tag={tag}
                triggers={triggers}
                type={type}
              />

            </PageBody>
            <PageBody className="page__body-up">
              <PageContent>
                <div className="layout__space-double" />
                <div className="layout__row">
                  {createPostForm}
                  {this.props.children}
                </div>
              </PageContent>
              <SidebarAlt>
                {addedTags}
              </SidebarAlt>
            </PageBody>
          </PageMain>
        </Page>

        <Footer />
      </div>
    );
  }
}
