import React, { PropTypes } from 'react';
import { form as inform } from 'react-inform';

import GeoInput from '../components/geo-input';
import Message from '../components/message';


class SchoolEditForm extends React.Component {
  static propTypes = {
    fields: PropTypes.shape({
      description: PropTypes.shape().isRequired,
      name: PropTypes.shape({
        error: PropTypes.string
      }).isRequired
    }).isRequired,
    form: PropTypes.shape({
      forceValidate: PropTypes.func.isRequired,
      isValid: PropTypes.func.isRequired,
      onValues: PropTypes.func.isRequired
    }).isRequired,
    saveSchoolHandler: PropTypes.func.isRequired,
    school: PropTypes.shape({
      description: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
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

    this.props.saveSchoolHandler(
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
