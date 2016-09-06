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

class BookmarkSettingsForm extends React.Component {
  static propTypes = {
    fields: PropTypes.shape({}),
    form: PropTypes.shape({}),
    onSave: PropTypes.func,
    title: PropTypes.string,
    to: PropTypes.string
  };

  static defaultProps = {
    onSave: () => {}
  };

  componentDidMount() {
    const { form, title, to } = this.props;

    form.onValues({ title, to });
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const { form, onSave } = this.props;

    form.forceValidate();
    if (!form.isValid()) {
      return;
    }

    const newValues = form.values();
    onSave(newValues);
  };

  render() {
    const { fields } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="layout__row">
          <input {...fields.title} />
          {fields.title.error &&
            <Message message={fields.title.error} />
          }
        </div>
        <div className="layout__row">
          <input {...fields.title} />
          {fields.to.error &&
            <Message message={fields.to.error} />
          }
        </div>
      </form>
    );
  }
}

const WrappedBookmarkSettingsForm = inform(from({
  icon: {},
  title: {},
  to: {}
}))(BookmarkSettingsForm);

export default WrappedBookmarkSettingsForm;
