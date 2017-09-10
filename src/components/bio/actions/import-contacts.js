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
import isEqual from 'lodash/isEqual';
import Switch from 'react-toggle-switch';
import Link from 'react-router/lib/Link';

import { addError } from '../../../actions/messages';
import gmailImg from '../../../images/services/gmail.png';
import yahooImg from '../../../images/services/yahoo.png';
import Button from '../../button';
import Modal from '../../sidebar-modal';
import Card from '../card';

const icon = { icon: 'image', pack: 'fa' };

const SERVICES = [
  { name: 'gmail', title: 'Gmail', img: gmailImg },
  { name: 'yahoo', title: 'Yahoo!', img: yahooImg },
];

export default class ImportContactsAction extends React.Component {
  static displayName = 'ImportContactsAction';

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

  constructor(...args) {
    super(...args);
    this.state = {
      isActive: false,
      isChecked: false
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props || !isEqual(nextState, this.state);
  }

  handleCardClick = () => {
    this.setState({ isActive: true });
  };

  handleModalClose = () => {
    this.setState({ isActive: false });
  };

  handleSwitch = () => {
    this.setState((state) => ({ isChecked: !state.isChecked }));
  };

  handleSubmit = async () => {
    try {
      this.handleModalClose();
    } catch (e) {
      this.props.dispatch(addError(e.message));
    }
  };

  render() {
    return (
      <Card
        className="bio__card--bg_1"
        icon={icon}
        title="Import your contacts"
        onClick={this.handleCardClick}
      >
        <Modal.Overlay isVisible={this.state.isActive}>
          <Modal isVisible={this.state.isActive} onClose={this.handleModalClose}>
            <Modal.Header theme="colored" onClose={this.handleModalClose}>
              Import your contacts
            </Modal.Header>
            <Modal.Body>
              Importing your contacts does not send out any invitations.
              <div className="sidebar-modal__actions layout layout-align_vertical">
                {SERVICES.map(s =>
                  <div className="service-card" key={s.name}>
                    <img alt={s.title} className="service-card__icon" src={s.img} />
                    <div className="service-card__title">{s.title}</div>
                  </div>
                )}
              </div>
              <div className="sidebar-modal__actions layout layout-align_vertical">
                <Switch on={this.state.isChecked} onClick={this.handleSwitch} />
                <span className="margin--all_left--h font--size_small">
                  Email each and everyone I know about us.&nbsp;
                  <Link className="font--underlined" to="/settings">Learn more</Link>
                </span>
              </div>
              <div className="layout sidebar-modal__actions">
                <Button
                  className="sidebar-modal__button sidebar-modal__button--type_submit"
                  title="Import"
                  onClick={this.handleSubmit}
                />
                <Button
                  className="sidebar-modal__button sidebar-modal__button--type_cancel"
                  title="No."
                  onClick={this.handleModalClose}
                />
              </div>
            </Modal.Body>
          </Modal>
        </Modal.Overlay>
      </Card>
    );
  }
}
