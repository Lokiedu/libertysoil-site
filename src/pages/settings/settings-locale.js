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
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import transform from 'lodash/transform';

import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import { ActionsTrigger } from '../../triggers';
import { createSelector, currentUserSelector } from '../../selectors';
import { DEFAULT_LOCALE } from '../../consts/localization';

const SUPPORTED_LOCALES = transform(
  require('../../consts/localization').SUPPORTED_LOCALES,
  (acc, locale, localeCode) => acc.push({ ...locale, code: localeCode }),
  []
);

class SettingsLocalePage extends React.Component {
  static displayName = 'SettingsLocalePage';

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props, ...args) {
    super(props, ...args);

    const userCode = props.current_user.getIn(
      ['user', 'more', 'lang'],
      DEFAULT_LOCALE
    );

    this.state = {
      code: userCode,
      isSubmitting: false
    };

    this.triggers = new ActionsTrigger(
      new ApiClient(API_HOST), this.props.dispatch
    );
  }

  handleSelect = async (e) => {
    if (this.state.isSubmitting) {
      return;
    }

    const nextCode = e.target.value;
    const prevCode = this.state.code;
    this.setState({ code: nextCode, isSubmitting: true });

    const status = await this.triggers.updateUserInfo({
      more: { lang: nextCode }
    });

    if (status) {
      await this.triggers.setLocale(nextCode);
      this.setState({ isSubmitting: false });
    } else {
      this.setState({ code: prevCode, isSubmitting: false });
    }
  };

  render() {
    const { is_logged_in } = this.props;

    if (!is_logged_in) {
      return false;
    }

    return (
      <div className="paper">
        <Helmet title="Language Settings on " />
        <div className="paper__page">
          <h2 className="content__sub_title layout__row layout__row-small">Language settings</h2>
          <div className="layout__row">
            <form className="paper__page">
              <label className="layout__row layout__row-small" htmlFor="mute_all_posts">
                <span className="">Which language do you want to use Liberty Soil in?</span>
                <select
                  className="input input-block input-select layout__row layout__row-small"
                  disabled={this.state.isSubmitting}
                  value={this.state.code}
                  onChange={this.handleSelect}
                >
                  {SUPPORTED_LOCALES.map(locale =>
                    <option
                      className="menu__item--theme_new"
                      key={locale.code}
                      value={locale.code}
                    >
                      {locale.title}
                    </option>
                  )}
                </select>
              </label>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  (current_user) => ({
    ...current_user
  })
);

export default connect(selector)(SettingsLocalePage);
