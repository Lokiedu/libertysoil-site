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
import { connect } from 'react-redux';
import { Link } from 'react-router';
import isEqual from 'lodash/isEqual';
import memoize from 'memoizee';
import t from 't8on';

import { SUPPORTED_LOCALES } from '../../consts/localization';
import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import { ActionsTrigger } from '../../triggers';
import createSelector from '../../selectors/createSelector';
import { removeAllMessages } from '../../actions/messages';

import Messages from '../messages';
import Modal from '../sidebar-modal';
import BasicTag from '../tag/theme/basic';
import LoginForm from './form';

const MAIN_ICON = {
  icon: 'sign-in'
};

const ERROR_MESSAGES = [
  'api.errors.internal',
  'login.errors'
];

const ERROR_TAG_MAPPING = {
  'login.errors.invalid': {
    icon: { bg: 'orange', name: 'question', size: { inner: 'ms' } },
    name: { name: (translate) => translate('login.qs.forget_pass') },
    url: '/resetpassword'
  }
};

const MESSAGE_CLOSE_ICON = {
  pack: 'fa', relative: true, size: { outer: 'l' }
};

function ActionTag({ url, translate, ...props }) {
  const content = (
    <BasicTag
      className="form__tag tag--size_small"
      {...props}
      name={{
        ...props.name,
        name: props.name.name(translate)
      }}
    />
  );

  if (url) {
    return (
      <Link to={url}>
        {content}
      </Link>
    );
  }

  return content;
}

const id1Cached = memoize(x => x, { simplified: true });

class LoginComponentV2 extends React.Component {
  static displayName = 'LoginComponentV2';

  static propTypes = {
    dispatch: PropTypes.func,
    onSubmit: PropTypes.func,
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

    let result;
    if (this.props.onSubmit) {
      result = await this.props.onSubmit(username, password);
    } else {
      result = await this.triggers.login(false, username, password);
    }

    if (result) {
      this.props.onClose();
    }
  };

  render() {
    const { locale, messages, onClose } = this.props;

    const translate = t.translateTo(locale);
    const rtl = SUPPORTED_LOCALES[locale].rtl;

    let headerContent, subheader;
    if (messages.size) {
      const firstMessage = messages.first().get('message');
      const props = ERROR_TAG_MAPPING[firstMessage];
      if (props) {
        headerContent = (
          <ActionTag
            translate={translate}
            {...props}
          />
        );
        subheader = (
          <div className="form__background--bright form__subheader">
            {translate('login.action')}
          </div>
        );
      } else {
        headerContent = translate('login.action');
      }
    } else {
      headerContent = translate('login.action');
    }

    let cn = 'form form--stretch_y';
    if (rtl) {
      cn += ' form--rtl';
    }

    return (
      <Modal.Overlay isVisible={this.props.isVisible}>
        <Modal.Main
          className={cn}
          innerClassName="form__container sidebar-form__container"
          isVisible={this.props.isVisible}
          rtl={rtl}
          onCloseTo={onClose && onClose.to}
        >
          <Modal.Header
            className="form__title sidebar-modal__title--big"
            closeIcon={false}
            mainIcon={MAIN_ICON}
            theme="colored"
          >
            <div className="form__title">
              {headerContent}
            </div>
          </Modal.Header>
          <Modal.Body raw className="form__background--dark">
            <Messages
              animated
              className="form__messages form__messages--theme_popup"
              innerProps={id1Cached({
                className: 'form__message form__message--theme_popup',
                closeIcon: MESSAGE_CLOSE_ICON,
                mode: 'long',
                rtl,
                statusIcon: false,
                translate
              })}
              messages={messages}
              removeMessage={this.triggers.removeMessage}
            />
            {subheader}
            <LoginForm
              translate={translate}
              onSubmit={this.handleSubmit}
            />
          </Modal.Body>
        </Modal.Main>
      </Modal.Overlay>
    );
  }
}

const mapStateToProps = createSelector(
  state => state.getIn(['ui', 'locale']),
  state => state.get('messages').filter(msg =>
    ERROR_MESSAGES.find(m => msg.get('message').startsWith(m))
  ),
  (locale, messages) =>
    ({ locale, messages: messages.toList() })
);

export default connect(mapStateToProps)(LoginComponentV2);
