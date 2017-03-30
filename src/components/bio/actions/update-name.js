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
import React, { PropTypes } from 'react';

import { getName } from '../../../utils/user';
import Button from '../../button';
import ModalComponent from '../../modal-component';
import Card from '../card';

const icon = { icon: 'user', pack: 'fa' };

export default class UpdateNameAction extends React.Component {
  static displayName = 'UpdateNameAction';

  static propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    triggers: PropTypes.shape({
      updateUser: PropTypes.func
    })
  };

  constructor(...args) {
    super(...args);
    this.state = {
      isActive: false,
      isSubmitting: false
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props ||
      nextState.isActive !== this.state.isActive ||
      nextState.isSubmitting !== this.state.isSubmitting;
  }

  handleCardClick = () => {
    this.setState({ isActive: true });
  };

  handleModalClose = () => {
    this.setState({ isActive: false });
  };

  handleSubmit = async (e) => {
    e.persist();
    e.preventDefault();

    if (this.state.isSubmitting) {
      return;
    }

    this.setState({ isSubmitting: true });
    const form = e.target;
    const success = await this.props.triggers.updateUserInfo({ more: {
      firstName: form.firstName.value,
      lastName: form.lastName.value
    } });

    if (success) {
      this.setState({ isActive: false });
    }
    this.setState({ isSubmitting: false });
  };

  render() {
    const { user } = this.props;
    const userMore = user.get('more');

    let action;
    if (user.get('fullName') === ' ') {
      action = 'Add';
    } else {
      action = 'Edit';
    }

    return (
      <Card
        className="bio__card--bg_4"
        icon={icon}
        title={action.concat(' real name')}
        onClick={this.handleCardClick}
      >
        {this.state.isActive &&
          <ModalComponent onHide={this.handleModalClose}>
            <ModalComponent.Head>
              <ModalComponent.Title>{action} real name for {getName(user)}</ModalComponent.Title>
            </ModalComponent.Head>
            <ModalComponent.Body>
              <form action="" onSubmit={this.handleSubmit}>
                <div className="form__row tools_page__item tools_page__item--close">
                  <label className="form__label form__label--no_space" htmlFor="firstName">First name</label>
                  <div className="input_wrap">
                    <input
                      autoFocus
                      className="input input-block input-narrow input-transparent"
                      defaultValue={userMore.get('firstName')}
                      id="firstName"
                      name="firstName"
                      type="text"
                    />
                  </div>
                </div>
                <div className="form__row tools_page__item tools_page__item--close">
                  <label className="form__label form__label--no_space" htmlFor="firstName">Last name</label>
                  <div className="input_wrap">
                    <input
                      className="input input-block input-narrow input-transparent"
                      defaultValue={userMore.get('lastName')}
                      id="lastName"
                      name="lastName"
                      type="text"
                    />
                  </div>
                </div>
                <footer className="layout layout__grid add_tag_modal__footer">
                  <Button
                    className="button-wide"
                    color="red"
                    disabled={this.state.isSubmitting}
                    title="Save"
                    type="submit"
                    waiting={this.state.isSubmitting}
                  />
                  <Button
                    className="button-wide add_tag_modal__cancel_button"
                    title="Cancel"
                    onClick={this.handleModalClose}
                  />
                </footer>
              </form>
            </ModalComponent.Body>
          </ModalComponent>
        }
      </Card>
    );
  }
}
