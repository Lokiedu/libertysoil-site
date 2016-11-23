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
import { Map as ImmutableMap } from 'immutable';
import { form as inform } from 'react-inform';
import { each, pick, reduce } from 'lodash';

import { ArrayOfMessages as ArrayOfMessagesPropType } from '../../prop-types/messages';
import { School as SchoolPropType } from '../../prop-types/schools';
import { removeWhitespace } from '../../utils/lang';

import Button from '../button';
import GeoInput from '../geo-input';
import Messages from '../messages';
import Message from '../message';

const TextInputField = ({ field, name, title, ...props }) => (
  <div className="layout__row">
    <label
      className="layout__block layout__row layout__row-small"
      htmlFor={`input_${name}`}
    >
      {title}
    </label>
    <input
      className="input input-block content layout__row layout__row-small"
      {...props}
      {...field}
      id={`input_${name}`}
    />

    {field.error &&
      <Message internal message={field.error} />
    }
  </div>
);

TextInputField.defaultProps = {
  field: {},
  type: 'text'
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
    messages: ArrayOfMessagesPropType,
    processing: PropTypes.bool,
    saveHandler: PropTypes.func.isRequired,
    school: SchoolPropType
  };

  static defaultProps = {
    school: ImmutableMap()
  };

  componentWillMount() {
    const school = this.props.school.toJS();

    if (school.id) {
      let is_open = 'unknown';

      if (school.is_open === true) {
        is_open = 'yes';
      } else if (school.is_open === false) {
        is_open = 'no';
      }

      const memberships = {};
      each(school.org_membership, (row, key) => {
        memberships[key] = row.is_member;
      });

      const values = {
        ...pick(
          school,
          [
            'name', 'description',
            'principal_name', 'principal_surname',
            'country_id', 'postal_code', 'city', 'address1', 'address2', 'house', 'phone',
            'website', 'facebook', 'twitter', 'wikipedia'
          ]
        ),
        ...{ is_open },
        ...memberships
      };

      this.props.form.onValues(values);
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();

    const { fields, form } = this.props;

    form.forceValidate();

    if (!form.isValid()) {
      return;
    }

    const theForm = event.target;

    const isOpenValue = fields.is_open.value;
    let isOpenDbValue = null;
    if (isOpenValue === 'yes') {
      isOpenDbValue = true;
    } else if (isOpenValue === 'no') {
      isOpenDbValue = false;
    }

    let lat = theForm.lat.value, lon = theForm.lon.value;
    if ((lat === '0') && (lon === '0')) {
      lat = undefined;
      lon = undefined;
    }

    this.props.saveHandler(
      theForm.id.value,
      {
        name: fields.name.value,
        description: fields.description.value,
        country_id: fields.country_id.value,
        lat,
        lon,
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
          adec: { is_member: theForm.adec.checked },
          aero: { is_member: theForm.aero.checked },
          australian: { is_member: null },
          eudec: { is_member: theForm.eudec.checked },
          iden: { is_member: theForm.iden.checked },
          alternative_to_school: { is_member: theForm.alternative_to_school.checked },
          wikipedia_list: { is_member: theForm.wikipedia_list.checked }
        }
      }
    );
  };

  render() {
    const {
      countries,
      fields,
      school,
      processing,
      triggers,
      messages
    } = this.props;

    const initialLocation = {};
    if (school.has('id')) {
      initialLocation.let = school.get('lat');
      initialLocation.lon = school.get('lon');
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <input name="id" type="hidden" value={school.get('id')} />

        <TextInputField disabled={school.has('name')} field={fields.name} name="name" title="Name" />

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
            {countries.toList().sortBy(c => c.get('name')).map(country =>
              <option key={country.get('id')} value={country.get('id')}>{country.get('name')}</option>
            )}
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
            <label>ADEC
              <input name="adec" type="checkbox" {...fields.adec} />
            </label>
          </div>

          <div className="layout__row">
            <label>AERO
              <input name="aero" type="checkbox" {...fields.aero} />
            </label>
          </div>

          {/*
          <div className="layout__row">
            <label>Australian
              <input name="australian" type="checkbox" {...fields.australian}/>
            </label>
          </div>
          */}

          <div className="layout__row">
            <label>EUDEC
              <input name="eudec" type="checkbox" {...fields.eudec} />
            </label>
          </div>

          <div className="layout__row">
            <label>IDEN
              <input name="iden" type="checkbox" {...fields.iden} />
            </label>
          </div>

          <div className="layout__row">
            <label>AlternativeToSchool.com entry
              <input name="alternative_to_school" type="checkbox" {...fields.alternative_to_school} />
            </label>
          </div>

          <div className="layout__row">
            <label>Wikipedia list of schools entry
              <input name="wikipedia_list" type="checkbox" {...fields.wikipedia_list} />
            </label>
          </div>
        </div>

        <div className="layout__row layout__space-triple">
          <div className="layout layout__grid layout-align_right">
            <Button
              className="button-green"
              disabled={!this.props.form.isValid()}
              title="Save"
              type="submit"
              waiting={processing}
            />
          </div>
        </div>
        <Messages messages={messages} removeMessage={triggers.removeMessage} />
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
const defaultValidate = (values = {}) => {
  const errors = {};
  const name = removeWhitespace(values.name);
  if (!name) {
    errors.name = 'Name is required';
  }

  return errors;
};

export default inform({
  fields,
  validate: defaultValidate
})(SchoolEditForm);

const ExtendableSchoolEditForm = ({ validators }) => inform({
  fields,
  validate: values => reduce(
    [defaultValidate].concat(validators),
    (e, validate) => validate(values, e),
    {}
  )
})(SchoolEditForm);

ExtendableSchoolEditForm.propTypes = {
  validators: PropTypes.arrayOf(PropTypes.func)
};

ExtendableSchoolEditForm.defaultProps = {
  validate: []
};

export { ExtendableSchoolEditForm };
