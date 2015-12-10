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
import _ from 'lodash';

import Map from './map';
import PickpointInput from '../components/pickpoint-input';

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
    initialLocation: {lat: null, lon: null},
    // pos - {lat: Number, lon: Number}
    onSelect: function (pos) {}
  };

  constructor(props) {
    super(props);

    this.state = {
      L: null,
      map: null,
      marker: null,
      selectedLocation: {lat: null, lon: null}
    };
  }

  componentDidMount() {
    // Initialize hidden inputs just in case.
    if (this.props.initialLocation) {
      let { lat, lon } = this.props.initialLocation;

      this._setLatLonInputs(lat, lon);
    }
  }

  componentDidUpdate(oldProps, oldState) {
    let { map, selectedLocation } = this.state;

    if (map && this._shouldSelectLocation(selectedLocation, oldState.selectedLocation)) {
      this._selectLocation(selectedLocation);
    }
  }

  static ZOOM = 9;

  _mapCreatedHandler(map, L) {
    let initialLocation = this.props.initialLocation;
    let newState = {map, L};

    // Set initial view
    if (initialLocation.lat && initialLocation.lon) {
      newState.selectedLocation = initialLocation;
      map.setView(initialLocation, GeoInput.ZOOM);
    } else {
      map.locate({setView: true});
    }

    this.setState(newState);

    map.on('click', this._mapClickHandler.bind(this));
  }

  _mapClickHandler(event) {
    let location = {
      lat: event.latlng.lat,
      lon: event.latlng.lng
    };

    this.setState({
      selectedLocation: location
    });
  }

  _pickpointSelectHandler(suggestion) {
    let location = _.pick(suggestion, 'lat', 'lon');

    this.state.map.panTo(location);
    this.state.map.setZoom(GeoInput.ZOOM);
    this.setState({
      selectedLocation: location
    });
  }

  _selectLocation(location) {
    this._setLatLonInputs(location);
    this._setMapMarker(location);
    this.props.onSelect(location);
  }

  _setLatLonInputs(location) {
    this.refs.lat.value = location.lat;
    this.refs.lon.value = location.lon;
  }

  _setMapMarker(location) {
    let { L, map, marker } = this.state;

    if (marker) {
      map.removeLayer(marker);
    }

    let newMarker = L.marker(location);

    map.addLayer(newMarker);

    this.setState({
      marker: newMarker
    });
  }

  _shouldSelectLocation(newLocation, oldLocation) {
    return newLocation.lat !== oldLocation.lat || newLocation.lon !== oldLocation.lon;
  }

  render() {
    return (
      <div className="geo_input_wrapper">
        <input name="lat" ref="lat" type="hidden" />
        <input name="lon" ref="lon" type="hidden" />
        <Map className="geo_input__map" onMapCreated={this._mapCreatedHandler.bind(this)} />
        <div className="geo_input__pickpoint_wrapper">
          <PickpointInput onSelect={this._pickpointSelectHandler.bind(this)} />
        </div>
      </div>
    );
  }
}
