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

import Message from '../message';

class HashtagEditForm extends React.Component {
  static displayName = 'HashtagEditForm';

  static propTypes = {
    fields: PropTypes.shape({
      description: PropTypes.shape().isRequired
    }).isRequired,
    form: PropTypes.shape({
      forceValidate: PropTypes.func.isRequired,
      isValid: PropTypes.func.isRequired,
      onValues: PropTypes.func.isRequired
    }).isRequired,
    saveHandler: PropTypes.func.isRequired,
    hashtag: PropTypes.shape({
      name: PropTypes.string
    }).isRequired
  };

  componentDidMount() {
    const {
      form,
      hashtag
     } = this.props;

    form.onValues(hashtag);
  }

  submitHandler = (event) => {
    event.preventDefault();

    const { fields, form } = this.props;

    form.forceValidate();

    if (!form.isValid()) {
      return;
    }

    this.props.saveHandler(
      fields.description.value
    );
  };

  render() {
    const { fields, form, hashtag } = this.props;

    return (
      <form onSubmit={this.submitHandler}>
        <div className="layout__row">
          <label className="layout__block layout__row layout__row-small" htmlFor="description">Description</label>
          <textarea
            className="input input-block input-textarea content layout__row layout__row-small"
            defaultValue={hashtag.description}
            {...fields.description}
          />

          {fields.description.error &&
            <Message message={fields.description.error} />
          }
        </div>

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

const fields = ['description'];
const validate = values => {
  const { description } = values;
  const errors = {};

  if (description && description.length > 100) {
    errors.description = 'There are too many symbols in the description';
  }

  return errors;
};

const WrappedHashtagEditForm = inform({
  fields,
  validate
})(HashtagEditForm);

export default WrappedHashtagEditForm;