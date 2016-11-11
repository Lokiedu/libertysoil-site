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
import React from 'react';
import pick from 'lodash/pick';
import throttle from 'lodash/throttle';
import { connect } from 'react-redux';

import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import { TAG_SCHOOL } from '../../consts/tags';
import createSelector from '../../selectors/createSelector';
import { ActionsTrigger } from '../../triggers';
import { addError, removeAllMessages } from '../../actions/messages';
import { removeWhitespace } from '../../utils/lang';

import { ExtendableSchoolEditForm } from '../../components/tag-edit-form/school-edit-form';
import Message from '../../components/message';
import Tag from '../../components/tag';

export class AddSchoolToolPage extends React.Component {
  static async fetchData(router, store, client) {
    const triggers = new ActionsTrigger(client, store.dispatch);
    const countries = store.getState().getIn(['geo', 'countries']);
    if (countries.size === 0) {
      await triggers.getCountries();
    }

    return 200;
  }

  constructor(...args) {
    super(...args);
    this.client = null;
    this.triggers = null;
    this.SchoolEditForm = ExtendableSchoolEditForm({
      validators: [this.validate]
    });

    this.state = {
      processing: false,
      newSchool: null
    };
  }

  componentWillMount() {
    this.client = new ApiClient(API_HOST);
    this.triggers = new ActionsTrigger(this.client, this.props.dispatch);
  }

  handleSave = async (_, school) => {
    if (!window.confirm('After adding this tag you won\'t be able to edit school name anymore. Are you sure school name is corrent?')) {
      return;
    }

    this.props.dispatch(removeAllMessages());
    this.setState({ processing: true });

    let newSchool = null;
    try {
      newSchool = await this.triggers.createSchool(school);
      this.form.formProps().onValues({});
    } catch (e) {
      this.props.dispatch(addError(e.message));
    }

    this.setState({ processing: false, newSchool });
  };

  validate = throttle(async (values, errors) => {
    const nextErrors = errors;
    if (values && values.name && !errors.name) {
      const name = removeWhitespace(values.name);

      if (name) {
        const exists = await this.client.checkSchoolExists(name);

        if (exists) {
          nextErrors.name = 'School with such name already exists';
        }
      }
    }

    return nextErrors;
  }, 100);

  render() {
    const school = this.state.newSchool;

    let messageVisibility;
    if (!school) {
      messageVisibility = 'hidden';
    }

    return (
      <div>
        <Message internal>
          After adding this tag you won't be able to edit school name anymore.
          Please be sure to get it right the first time!"
        </Message>
        <this.SchoolEditForm
          countries={this.props.countries}
          messages={this.props.messages}
          processing={this.state.processing}
          ref={c => this.form = c}
          saveHandler={this.handleSave}
          triggers={pick(this.triggers, ['removeMessage'])}
        />
        <div className="layout__row" style={{ visibility: messageVisibility }}>
          <Message internal>
            <div className="layout">
              New school:
              {school &&
                <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                  <Tag
                    name={school.name}
                    ref={c => this.msg = c}
                    type={TAG_SCHOOL}
                    urlId={school.url_name}
                  />
                </div>
              }
            </div>
          </Message>
        </div>
      </div>
    );
  }
}

const inputSelector = createSelector(
  state => state.getIn(['geo', 'countries']),
  state => state.get('messages'),
  (countries, messages) => ({ countries, messages })
);
const outputSelector = dispatch => ({ dispatch });

export default connect(inputSelector, outputSelector, null, { pure: false })(AddSchoolToolPage);
