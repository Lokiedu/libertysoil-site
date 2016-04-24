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
import { form as inform } from 'react-inform';
import Loader from 'react-loader';
import { sortBy } from 'lodash';

import GeoInput from '../geo-input';
import Message from '../message';
import { LOADER_OPTIONS } from '../../consts/loader';

class SchoolEditForm extends React.Component {
  static displayName = 'SchoolEditForm';

  static propTypes = {
    countries: PropTypes.objectOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })).isRequired,
    fields: PropTypes.shape({
      description: PropTypes.shape().isRequired,
      name: PropTypes.shape({
        error: PropTypes.string
      }).isRequired
    }).isRequired,
    form: PropTypes.shape({
      forceValidate: PropTypes.func,
      isValid: PropTypes.func,
      onValues: PropTypes.func
    }).isRequired,
    saveHandler: PropTypes.func.isRequired,
    school: PropTypes.shape({
      description: PropTypes.string,
      id: PropTypes.string,
      lat: PropTypes.number,
      lon: PropTypes.number,
      name: PropTypes.string
    }).isRequired
  };

  componentDidMount() {
    const {
      form,
      school
     } = this.props;

    form.onValues(school);
  }

  submitHandler = (event) => {
    event.preventDefault();

    const { fields, form } = this.props;

    form.forceValidate();

    if (!form.isValid()) {
      return;
    }

    let theForm = event.target;

    const isOpenValue = fields.is_open.value;
    let isOpenDbValue = null;
    if (isOpenValue === 'yes') {
      isOpenDbValue = true;
    } else if (isOpenValue === 'no') {
      isOpenDbValue = false;
    }

    this.props.saveHandler(
      theForm.id.value,
      {
        name: fields.name.value,
        description: fields.description.value,
        country_id: fields.country_id.value,
        lat: theForm.lat.value,
        lon: theForm.lon.value,
        is_open: isOpenDbValue,
        principal_name: fields.principal_name.value,
        principal_surname: fields.principal_surname.value,
      }
    );
  };

  render() {
    const { countries, fields, form, school, processing } = this.props;
    const initialLocation = {lat: school.lat, lon: school.lon};

    let is_open = 'unknown';

    if (school.is_open === true) {
      is_open = 'yes';
    } else if (school.is_open === false) {
      is_open = 'no';
    }

    return (
      <form onSubmit={this.submitHandler}>
        <input name="id" type="hidden" value={school.id} />

        <div className="layout__row">
          <label className="layout__block layout__row layout__row-small" htmlFor="name">Name</label>
          <input
            className="input input-block content layout__row layout__row-small"
            defaultValue={school.name}
            type="text"
            id="name"
            {...fields.name}
          />

          {fields.name.error &&
            <Message message={fields.name.error} />
          }
        </div>

        <div className="layout__row">
          <label className="layout__block layout__row layout__row-small" htmlFor="is_open">Is it open?</label>
          <select
            className="input input-block input-select layout__row layout__row-small"
            defaultValue={is_open}
            id="is_open"
            {...fields.is_open}
          >
            <option value="unknown">unknown</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div className="layout__row">
          <label className="layout__block layout__row layout__row-small" htmlFor="description">Description</label>
            <textarea
              className="input input-block input-textarea content layout__row layout__row-small"
              defaultValue={school.description}
              id="description"
              {...fields.description}
            />
        </div>

        <div className="layout__row">
          <label className="layout__block layout__row layout__row-small" htmlFor="country_id">Country</label>
          <select
            className="input input-block input-select layout__row layout__row-small"
            defaultValue={school.country_id}
            id="country_id"
            {...fields.country_id}
          >
            <option value="">unknown</option>
            {sortBy(countries, 'name').map(country => <option value={country.id} key={country.id}>{country.name}</option>)}
          </select>
        </div>

        <GeoInput initialLocation={initialLocation} />

        <div className="layout__row">
          <label className="layout__block layout__row layout__row-small" htmlFor="principal_name">Principal Name</label>
          <input
            className="input input-block content layout__row layout__row-small"
            defaultValue={school.principal_name}
            type="text"
            id="principal_name"
            {...fields.principal_name}
          />
        </div>

        <div className="layout__row">
          <label className="layout__block layout__row layout__row-small" htmlFor="principal_surname">Principal Surname</label>
          <input
            className="input input-block content layout__row layout__row-small"
            defaultValue={school.principal_surname}
            type="text"
            id="principal_name"
            {...fields.principal_surname}
          />
        </div>

        <div className="layout__row layout__space-triple">
          <div className="layout layout__grid layout-align_right" style={{position: 'relative'}}>
            <Loader loaded={!processing} options={{...LOADER_OPTIONS, left: '90%'}}>
              <button
                className="button button-wide button-green"
                disabled={!form.isValid()}
                type="submit"
              >
                Save
              </button>
            </Loader>
          </div>
        </div>
      </form>
    );
  }
}

const fields = ['name', 'description', 'is_open', 'principal_name', 'principal_surname', 'country_id'];
const validate = values => {
  const { name } = values;
  const errors = {};

  if (!name) {
    errors.name = 'Name is required';
  }

  return errors;
};

const WrappedSchoolEditForm = inform({
  fields,
  validate
})(SchoolEditForm);

export default WrappedSchoolEditForm;
