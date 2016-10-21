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
import { form as inform, from } from 'react-inform';

import Message from '../message';

class BasicInfoForm extends React.Component {
  static displayName = 'BasicInfoForm';

  static propTypes = {
    current_user: PropTypes.shape().isRequired,
    fields: PropTypes.shape({
      bio: PropTypes.shape().isRequired,
      summary: PropTypes.shape().isRequired
    }).isRequired,
    form: PropTypes.shape({
      onValues: PropTypes.func.isRequired
    }).isRequired
  };

  componentWillMount() {
    const { current_user, form } = this.props;

    form.onValues({
      bio: current_user.getIn(['user', 'more', 'bio']),
      summary: current_user.getIn(['user', 'more', 'summary'])
    });
  }

  render() {
    const { fields } = this.props;

    return (
      <form className="paper__page" ref={c => this.form = c}>
        <h2 className="content__sub_title layout__row layout__row-small">Basic info</h2>
        <div className="layout__row">
          <label className="layout__block layout__row layout__row-small" htmlFor="summary">Summary</label>
          <input
            className="input input-block content layout__row layout__row-small"
            id="summary"
            maxLength="100"
            name="summary"
            type="text"
            {...fields.summary}
          />
          {fields.summary.error &&
            <Message message={fields.summary.error} />
          }
        </div>
        <div className="layout__row">
          <label className="layout__block layout__row layout__row-small" htmlFor="bio">Bio</label>
          <textarea
            className="input input-block input-textarea content layout__row layout__row-small"
            id="bio"
            maxLength="5000"
            name="bio"
            {...fields.bio}
          />
          {fields.bio.error &&
            <Message message={fields.bio.error} />
          }
        </div>
      </form>
    );
  }
}

const WrappedBasicInfoForm = inform(from({
  bio: {},
  summary: {}
}))(BasicInfoForm);

export default WrappedBasicInfoForm;
