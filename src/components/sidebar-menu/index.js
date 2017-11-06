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
import { omit, values } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import { MediaTargets as ts, MediaQueries as qs } from '../../consts/media';
import Navigation from '../navigation';
import * as MenuItemsObject from './items';

const MenuItems = values(MenuItemsObject);

function getMatchedMedia(ignore) {
  if (ignore !== ts.xs && window.matchMedia(qs.xs).matches) {
    return ts.xs;
  }
  if (ignore !== ts.s && window.matchMedia(qs.s).matches) {
    return ts.s;
  }
  if (ignore !== ts.m && window.matchMedia(qs.m).matches) {
    return ts.m;
  }
  if (ignore !== ts.l && window.matchMedia(qs.l).matches) {
    return ts.l;
  }
  return ts.xl;
}

export default class SidebarMenu extends React.PureComponent {
  static propTypes = {
    adaptive: PropTypes.bool
  };

  static propKeys = Object.keys(SidebarMenu.propTypes);

  constructor(props, context) {
    super(props, context);
    const state = { media: undefined };

    if (
      props.adaptive &&
      typeof window !== 'undefined' &&
      window !== null &&
      window.matchMedia
    ) {
      state.media = getMatchedMedia();
      this.attachListener(state.media);
    } else {
      state.media = ts.xs;
    }

    this.state = state;
    this.restProps = omit(props, SidebarMenu.propKeys);
  }

  componentWillReceiveProps(nextProps) {
    this.restProps = omit(nextProps, SidebarMenu.propKeys);
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.media !== this.state.media) {
      this.detachListener();
      this.attachListener(nextState.media);
    }
  }

  componentWillUnmount() {
    if (this.query) {
      this.detachListener();
    }
  }

  attachListener = (media) => {
    this.query = window.matchMedia(qs[media]);
    this.query.addListener(this.handleViewChange);
  };

  detachListener = () => {
    this.query.removeListener(this.handleViewChange);
  };

  handleViewChange = () => {
    const next = getMatchedMedia(this.state.media);
    this.setState(state => ({ ...state, media: next }));
  };

  query = null;

  render() {
    const { media } = this.state;

    return (
      <Navigation>
        {MenuItems.map(Item => (
          <Item
            key={Item.displayName}
            media={media}
            {...this.restProps}
          />
        ))}
      </Navigation>
    );
  }
}
