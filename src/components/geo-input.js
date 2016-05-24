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

import MapboxMap from './mapbox-map';
import PickpointInput from './pickpoint-input';


export default class GeoInput extends React.Component {
  static displayName = "GeoInput";

  static propTypes = {
    initialLocation: PropTypes.shape({
      lat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      lon: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    }),
    onSelect: PropTypes.func
  };

  static defaultProps = {
    onSelect: (/* pos */) => {}
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedLocation: props.initialLocation,
      viewLocation: props.initialLocation
    };
  }

  componentDidMount() {
    const { initialLocation } = this.props;

    // Autodetect location
    if (!initialLocation || !initialLocation.lat || !initialLocation.lon) {
      this._map.leafletMap.leafletElement.locate();
    }
  }

  _handlePickpointSelect = (event) => {
    const location = {
      lat: event.lat,
      lon: event.lon
    };

    this.setState({
      selectedLocation: location,
      viewLocation: location
    });
  };

  _handleLocationFound = (event) => {
    const location = {
      lat: event.latitude,
      lon: event.longitude
    };

    this.setState({
      selectedLocation: location,
      viewLocation: location
    });
  };

  _handleClickOnMap = (event) => {
    const location = {
      lat: event.latlng.lat,
      lon: event.latlng.lng
    };

    this.setState({
      selectedLocation: location
    });
  };

  render() {
    const selectedLocation = {
      lat: parseFloat(this.state.selectedLocation.lat) || 0,
      lon: parseFloat(this.state.selectedLocation.lon) || 0
    };

    const viewLocation = {
      lat: parseFloat(this.state.viewLocation.lat) || 0,
      lon: parseFloat(this.state.viewLocation.lon) || 0
    };

    return (
      <div className="geo_input_wrapper">
        <input name="lat" type="hidden" value={selectedLocation.lat} />
        <input name="lon" type="hidden" value={selectedLocation.lon} />
        <MapboxMap
          className="geo_input__map"
          ref={c => this._map = c}
          selectedLocation={selectedLocation}
          viewLocation={viewLocation}
          onClick={this._handleClickOnMap}
          onLocationfound={this._handleLocationFound}
        />
        <div className="geo_input__pickpoint_wrapper">
          <PickpointInput onSelect={this._handlePickpointSelect} />
        </div>
      </div>
    );
  }
}
