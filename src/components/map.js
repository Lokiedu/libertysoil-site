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

import { MAPBOX_ACCESS_TOKEN } from '../config';

export default class Map extends React.Component {
  static displayName = 'Map';

  static propTypes = {
    className: PropTypes.string,
    mapId: PropTypes.string,
    onMapCreated: PropTypes.func
    // And a lot of mapbox options (see https://www.mapbox.com/mapbox-gl-js/api/)
  };

  static defaultProps = {
    onMapCreated: function () {}
  };
  
  componentDidMount() {
    let props = this.props;

    let mapId = props.mapId || props.src || "mapbox.streets";

    let options = {};
    let ownProps = ['mapId', 'onMapCreated'];
    for (let k in props) {
      if (props.hasOwnProperty(k) && ownProps.indexOf(k) === -1) {
        options[k] = props[k];
      }
    }
    options.accessToken = MAPBOX_ACCESS_TOKEN;

    let map = window.L.mapbox.map(this.refs.map, mapId, options);

    this.props.onMapCreated(map, window.L);
  }

  render() {
    let mapStyle = {
      width: '100%',
      height: '100%'
    };

    return (
      <div className={this.props.className}>
        <div ref="map" style={mapStyle}></div>
      </div>
    );
  }
}
