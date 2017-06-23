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
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { connect } from 'react-redux';
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import t from 't8on';

import { SUPPORTED_LOCALES } from '../../consts/localization';
import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import { ActionsTrigger } from '../../triggers';
import createSelector from '../../selectors/createSelector';
import { addError, removeAllMessages } from '../../actions/messages';

import Modal from '../sidebar-modal';
import MinifiedTag from '../tag/theme/minified';
import LoginForm from './form';

const MAIN_ICON = {
  icon: 'sign-in'
};

const ERROR_MESSAGES = [
  'api.errors.internal',
  'login.errors'
];

const FORM_ERROR_MESSAGE_MAPPING = {
  'username_req': 'login.errors.username_req',
  'password_req': 'login.errors.password_req'
};

const ERROR_TAG_MAPPING = {
  'login.errors.invalid': {
    icon: { color: 'orange', icon: 'question-circle' },
    name: { name: (translate) => translate('login.qs.forget_pass') }
  }
};

function Message({ className, children, long, translate, ...props }) {
  let message;
  if (long) {
    message = translate(children.concat('.long'));
    if (!message) {
      message = translate(children);
    }
  } else {
    message = translate(children.concat('.short'));
    if (!message) {
      message = translate(children);
    }
  }

  return (
    <div className={classNames('sidebar-form__message', className)} {...props}>
      {message}
    </div>
  );
}

class LoginComponentV2 extends React.Component {
  static displayName = 'LoginComponentV2';

  static propTypes = {
    dispatch: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    triggers: PropTypes.shape({
      uploadPicture: PropTypes.func,
      updateUserInfo: PropTypes.func
    })
  };

  static defaultProps = {
    dispatch: () => {}
  };

  constructor(props, ...args) {
    super(props, ...args);
    this.state = {
      isChecked: false
    };

    this.triggers = new ActionsTrigger(
      new ApiClient(API_HOST),
      props.dispatch
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props
      || !isEqual(nextState, this.state);
  }

  handleSubmit = async (isValid, username, password) => {
    this.props.dispatch(removeAllMessages());
    if (!isValid) {
      return;
    }

    const result = await this.triggers.login(username, password);
    if (result) {
      this.props.onClose();
    }
  };

  handleErrors = (formErrors) => {
    const { dispatch } = this.props;
    dispatch(removeAllMessages());

    for (const errorMessage of formErrors) {
      dispatch(addError(
        FORM_ERROR_MESSAGE_MAPPING[errorMessage]
      ));
    }
  };

  render() {
    const { locale, messages, onClose } = this.props;

    const translate = t.translateTo(locale);
    const format = t.formatTo(locale);
    const rtl = SUPPORTED_LOCALES[locale].rtl;

    let headerContent, subheader;
    if (messages.size) {
      const firstMessage = messages.first().get('message');
      const props = ERROR_TAG_MAPPING[firstMessage];
      if (props) {
        headerContent = (
          <MinifiedTag
            className="sidebar-form__tag"
            {...props}
            name={{
              ...props.name,
              name: props.name.name(translate)
            }}
          />
        );
        subheader = (
          <div className="sidebar-form__background--bright sidebar-form__subheader">
            {translate('login.action')}
          </div>
        );
      } else {
        headerContent = translate('login.action');
      }
    } else {
      headerContent = translate('login.action');
    }

    return (
      <Modal.Overlay isVisible={this.props.isVisible}>
        <Modal
          className="sidebar-form__container"
          isVisible={this.props.isVisible}
          rtl={rtl}
          onHide={onClose}
        >
          <Modal.Header
            className="sidebar-form__background--bright sidebar-form__title sidebar-modal__title--big"
            mainIcon={MAIN_ICON}
            closeIcon={false}
            onClose={onClose}
          >
            <div className="sidebar-form__title">
              {headerContent}
            </div>
          </Modal.Header>
          <Modal.Body raw className="sidebar-form__background--dark">
            <CSSTransitionGroup
              className="sidebar-form__background--bright"
              component="div"
              transitionEnter
              transitionEnterTimeout={250}
              transitionLeave
              transitionLeaveTimeout={250}
              transitionName="sidebar-form__message--transition"
            >
              {messages.size &&
                this.props.messages.map(msg =>
                  <Message key={msg.get('message')} long translate={translate}>
                    {msg.get('message')}
                  </Message>
                )
              }
            </CSSTransitionGroup>
            {subheader}
            <LoginForm
              format={format}
              rtl={rtl}
              translate={translate}
              onErrors={this.handleErrors}
              onSubmit={this.handleSubmit}
            />
          </Modal.Body>
        </Modal>
      </Modal.Overlay>
    );
  }
}

const mapStateToProps = createSelector(
  state => state.getIn(['ui', 'locale']),
  state => state.get('messages').filter(msg =>
    ERROR_MESSAGES.find(m => msg.get('message').startsWith(m))
  ),
  (locale, messages) => ({ locale, messages })
);

export default connect(mapStateToProps)(LoginComponentV2);
