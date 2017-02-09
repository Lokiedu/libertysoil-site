/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

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

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { ActionsTrigger } from '../triggers';
import { createSelector } from '../selectors';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../components/page';
import Footer from '../components/footer';
import Header from '../components/header';
import Message from '../components/message';


export const ResetForm = (props) => {
  return (
    <form className="layout__grid layout__grid-responsive layout-align_end layout__space-double" onSubmit={props.submitHandler} action="" method="post">
      <div className="layout__grid_item layout__grid_item-identical">
        <label className="label label-before_input" htmlFor="resetPasswordEmail">Email</label>
        <input className="input input-big input-block" id="resetPasswordEmail" required="required" type="email" name="email" />
      </div>
      <div className="layout__grid_item">
        <button type="submit" className="button button-big button-green">Submit</button>
      </div>
    </form>
  );
};

export const SuccessMessage = () => {
  return (
    <Message>
      If we found this email in our database, we have just sent you a message with further steps.
    </Message>
  );
};

export class PasswordResetPage extends React.Component {

  static propTypes = {
    ui: PropTypes.shape({
      submitResetPassword: PropTypes.bool
    }).isRequired
  };

  submitHandler = (event) => {
    event.preventDefault();

    const form = event.target;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    triggers.resetPassword(form.email.value);
  };

  render() {
    const {
      is_logged_in,
      ui
    } = this.props;

    let content = <ResetForm submitHandler={this.submitHandler} />;

    if (ui.get('submitResetPassword')) {
      content = <SuccessMessage />;
    }

    return (
      <div className="font-open_sans font-light">
        <Helmet title="Reset Password for " />
        <section className="landing landing-big landing-bg landing-bg_house">
          <Header
            className="header-transparent"
            is_logged_in={is_logged_in}
            needMenu={false}
          />
          <header className="landing__body">
            <p className="layout__row layout__row-small landing__small_title" style={{ position: 'relative', left: 4 }}>Welcome to LibertySoil.org</p>
            <h1 className="landing__subtitle landing__subtitle-narrow">Education change network</h1>
          </header>
        </section>

        <Page className="page__container-no_spacing page__container-bg">
          <PageMain>
            <PageBody className="page__body-small">
              <PageContent>
                <div className="content__title layout__row">Reset Password</div>
                <div className="layout__row">
                  {content}
                </div>
              </PageContent>
            </PageBody>
          </PageMain>
        </Page>

        <Footer />
      </div>
    );
  }
}

const selector = createSelector(
  state => !!state.getIn(['current_user', 'id']),
  state => state.get('ui'),
  (is_logged_in, ui) => ({
    is_logged_in,
    ui
  })
);

export default connect(selector)(PasswordResetPage);
