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

let Leaflet;

if (typeof (window) !== 'undefined') {
  Leaflet = require('react-leaflet');
}


export default class MapboxMap extends React.Component {
  static displayName = 'MapboxMap';

  static propTypes = {
    selectedLocation: PropTypes.shape({
      lat: PropTypes.number,
      lon: PropTypes.number
    }).isRequired,
    viewLocation: PropTypes.shape({
      lat: PropTypes.number,
      lon: PropTypes.number
    }).isRequired
  };

  render() {
    if (!Leaflet) {
      return null;
    }

    let {
      selectedLocation,
      viewLocation,
      ...props
    } = this.props;

    return (
      <Leaflet.Map
        center={viewLocation}
        ref={c => this.leafletMap = c}
        zoom={13}
        {...props}
      >
        <Leaflet.TileLayer
          attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>'
          url={`http://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=${MAPBOX_ACCESS_TOKEN}`}
        />
        <Leaflet.Marker position={selectedLocation} />
      </Leaflet.Map>
    );
  }
}
