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


const TextInputField = ({ field, name, title, type='text' }) => {
  const id = `input_${name}`;

  return (
    <div className="layout__row">
      <label className="layout__block layout__row layout__row-small" htmlFor={id}>{title}</label>
      <input
        className="input input-block content layout__row layout__row-small"
        id={id}
        type={type}
        {...field}
      />

      {field.error &&
        <Message message={field.error} />
      }
    </div>
  );
};

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
        postal_code: fields.postal_code.value,
        city: fields.city.value,
        address1: fields.address1.value,
        address2: fields.address2.value,
        house: fields.house.value,
        phone: fields.phone.value,
        website: fields.website.value,
        facebook: fields.facebook.value,
        twitter: fields.twitter.value,
        wikipedia: fields.wikipedia.value,
        org_membership: {
          adec: { is_member: fields.adec.value },
          aero: { is_member: fields.aero.value },
          australian: { is_member: null },
          eudec: { is_member: fields.eudec.value },
          iden: { is_member: fields.iden.value },
          alternative_to_school: { is_member: fields.alternative_to_school.value },
          wikipedia_list: { is_member: fields.wikipedia_list.value }
        }
      }
    );
  };

  render() {
    const { countries, fields, form, school, processing } = this.props;
    const initialLocation = {lat: school.lat, lon: school.lon};

    return (
      <form onSubmit={this.submitHandler}>
        <input name="id" type="hidden" value={school.id} />

        <TextInputField field={fields.name} name="name" title="Name" />

        <div className="layout__row">
          <label className="layout__block layout__row layout__row-small" htmlFor="is_open">Is it open?</label>
          <select
            className="input input-block input-select layout__row layout__row-small"
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
            id="description"
            {...fields.description}
          />
        </div>

        <div className="layout__row">
          <label className="layout__block layout__row layout__row-small" htmlFor="country_id">Country</label>
          <select
            className="input input-block input-select layout__row layout__row-small"
            id="country_id"
            {...fields.country_id}
          >
            <option value="">unknown</option>
            {sortBy(countries, 'name').map(country => <option value={country.id} key={country.id}>{country.name}</option>)}
          </select>
        </div>

        <TextInputField field={fields.postal_code} name="postal_code" title="Postal Code" />
        <TextInputField field={fields.city} name="city" title="City" />
        <TextInputField field={fields.address1} name="address1" title="Address" />
        <TextInputField field={fields.address2} name="address2" title="Address 2" />
        <TextInputField field={fields.house} name="house" title="House" />
        <TextInputField field={fields.phone} name="phone" title="Phone" />

        <GeoInput initialLocation={initialLocation} />

        <TextInputField field={fields.principal_name} name="principal_name" title="Principal Name" />
        <TextInputField field={fields.principal_surname} name="principal_surname" title="Principal Surname" />

        <TextInputField field={fields.website} name="website" title="Website" type="url" />
        <TextInputField field={fields.facebook} name="facebook" title="Facebook" type="url" />
        <TextInputField field={fields.twitter} name="twitter" title="Twitter" type="url" />
        <TextInputField field={fields.wikipedia} name="wikipedia" title="Wikipedia" type="url" />

        <div className="layout__row">
          <div className="layout__row">Membership:</div>

          <div className="layout__row">
            <label>ADEC <input type="checkbox" {...fields.adec}/></label>
          </div>

          <div className="layout__row">
            <label>AERO <input type="checkbox" {...fields.aero}/></label>
          </div>

          {/*
          <div className="layout__row">
            <label>Australian <input type="checkbox" {...fields.australian}/></label>
          </div>
          */}

          <div className="layout__row">
            <label>EUDEC <input type="checkbox" {...fields.eudec}/></label>
          </div>

          <div className="layout__row">
            <label>IDEN <input type="checkbox" {...fields.iden}/></label>
          </div>

          <div className="layout__row">
            <label>AlternativeToSchool.com entry <input type="checkbox" {...fields.alternative_to_school}/></label>
          </div>

          <div className="layout__row">
            <label>Wikipedia list of schools entry <input type="checkbox" {...fields.wikipedia_list}/></label>
          </div>
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

const fields = [
  'name', 'description', 'is_open',
  'principal_name', 'principal_surname',
  'country_id', 'postal_code', 'city', 'address1', 'address2', 'house', 'phone',
  'website', 'facebook', 'twitter', 'wikipedia',
  'adec', 'aero', 'australian', 'eudec', 'iden', 'alternative_to_school', 'wikipedia_list'
];
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
