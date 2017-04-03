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
import { isEmpty } from 'lodash';

import { MAPBOX_ACCESS_TOKEN } from '../config';

let Leaflet;

if (typeof (window) !== 'undefined') {
  require('leaflet').Icon.Default.imagePath = '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/';
  Leaflet = require('react-leaflet');
}


export default class MapboxMap extends React.Component {
  static displayName = 'MapboxMap';

  static propTypes = {
    frozen: PropTypes.bool,
    mapId: PropTypes.string,
    noWheelZoom: PropTypes.bool,
    selectedLocation: PropTypes.shape({
      lat: PropTypes.number,
      lon: PropTypes.number
    }),
    viewLocation: PropTypes.shape({
      lat: PropTypes.number,
      lon: PropTypes.number
    })
  };

  static defaultProps = {
    zoom: 13,
    frozen: false,
    noWheelZoom: false,
    mapId: 'mapbox.streets-basic'
  };

  componentDidMount() {
    const map = this.leafletMap.leafletElement;

    if (this.props.frozen) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.boxZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.keyboard.disable();
      map.removeControl(map.zoomControl);
    }

    if (this.props.noWheelZoom) {
      map.scrollWheelZoom.disable();
    }
  }

  render() {
    if (!Leaflet) {
      return null;
    }

    const {
      selectedLocation,
      viewLocation,
      mapId,
      ...props
    } = this.props;

    return (
      <Leaflet.Map
        center={viewLocation}
        ref={c => this.leafletMap = c}
        {...props}
      >
        <Leaflet.TileLayer
          attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>'
          url={`http://api.tiles.mapbox.com/v4/${mapId}/{z}/{x}/{y}.png?access_token=${MAPBOX_ACCESS_TOKEN}`}
        />
        {!isEmpty(selectedLocation) &&
          <Leaflet.Marker position={selectedLocation} />
        }
      </Leaflet.Map>
    );
  }
}
