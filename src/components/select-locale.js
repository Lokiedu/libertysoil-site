/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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
import PropTypes from 'prop-types';

import React from 'react';
import { connect } from 'react-redux';
import transform from 'lodash/transform';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { ActionsTrigger } from '../triggers';
import { createSelector } from '../selectors';
import { DEFAULT_LOCALE } from '../consts/localization';

import Select from './dropdown/select';
import MenuItem from './menu-item';

const SUPPORTED_LOCALES = transform(
  require('../consts/localization').SUPPORTED_LOCALES,
  (acc, locale, localeCode) => acc.push({ ...locale, code: localeCode }),
  []
);

function renderSelected(localeCode = '') {
  return localeCode.toUpperCase();
}

class SelectLocale extends React.Component {
  static displayName = 'SelectLocale';

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props, ...args) {
    super(props, ...args);

    this.state = {
      code: props.locale_code || DEFAULT_LOCALE,
      isSubmitting: false
    };

    this.triggers = new ActionsTrigger(
      new ApiClient(API_HOST), this.props.dispatch
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.locale_code !== this.props.locale_code) {
      this.setState({ code: nextProps.locale_code });
    }
  }

  handleChange = async (e) => {
    if (this.state.isSubmitting) {
      return;
    }

    const nextCode = e.target.value;
    const prevCode = this.state.code;
    this.setState({ code: nextCode, isSubmitting: true });

    const status = await this.triggers.setLocale(nextCode);

    if (status) {
      this.setState({ isSubmitting: false });
    } else {
      this.setState({ code: prevCode, isSubmitting: false });
    }
  };

  render() {
    return (
      <form>
        <Select
          className={this.props.className}
          disabled={this.state.isSubmitting}
          renderSelected={renderSelected}
          theme="new"
          value={this.state.code}
          onChange={this.handleChange}
        >
          {SUPPORTED_LOCALES.map(locale => (
            <MenuItem
              className="menu__item--theme_new color-text"
              isOption
              key={locale.code}
              value={locale.code}
            >
              {locale.title}
            </MenuItem>
          ))}
        </Select>
        {/*<select
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
        </select>*/}
      </form>
    );
  }
}

const selector = createSelector(
  state => state.getIn(['ui', 'locale']),
  (locale_code) => ({
    locale_code
  })
);

export default connect(selector)(SelectLocale);
