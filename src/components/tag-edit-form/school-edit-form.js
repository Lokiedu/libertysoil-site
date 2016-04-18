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

import GeoInput from '../geo-input';
import Message from '../message';

class SchoolEditForm extends React.Component {
  static displayName = 'SchoolEditForm';

  static propTypes = {
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

    this.props.saveHandler(
      theForm.id.value,
      fields.name.value,
      fields.description.value,
      theForm.lat.value,
      theForm.lon.value
    );
  };

  render() {
    const { fields, form, school } = this.props;
    const initialLocation = {lat: school.lat, lon: school.lon};
    
    return (
      <form onSubmit={this.submitHandler}>
        <input name="id" type="hidden" value={school.id} />

        <div className="layout__row">
          <label className="layout__block layout__row layout__row-small" htmlFor="name">Name</label>
          <input
            className="input input-block content layout__row layout__row-small"
            defaultValue={school.name}
            type="text"
            {...fields.name}
          />

          {fields.name.error &&
            <Message message={fields.name.error} />
          }
        </div>

        <div className="layout__row">
          <label className="layout__block layout__row layout__row-small" htmlFor="description">Description</label>
                <textarea
                  className="input input-block input-textarea content layout__row layout__row-small"
                  defaultValue={school.description}
                  {...fields.description}
                />
        </div>

        <GeoInput initialLocation={initialLocation} />

        <div className="layout__row">
          <div className="layout layout__grid layout-align_right">
            <button
              className="button button-wide button-green"
              disabled={!form.isValid()}
              type="submit"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    );
  }
}

const fields = ['name', 'description'];
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
