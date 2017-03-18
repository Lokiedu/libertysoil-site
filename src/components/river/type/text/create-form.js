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
import classNames from 'classnames';
import omit from 'lodash/omit';

import Button from '../../../button';
import Messages from '../../../messages';
import BasicRiverItem from '../../theme/basic';

export default class RiverItemCreateForm extends React.Component {
  static propTypes = {
    cancel: PropTypes.shape(),
    input: PropTypes.shape({
      placeholder: PropTypes.string
    }),
    onCancel: PropTypes.func,
    onError: PropTypes.func,
    onRemoveMessage: PropTypes.func,
    onSubmit: PropTypes.func,
    submit: PropTypes.shape(),
  };

  static defaultProps = {
    cancel: {},
    input: {},
    onCancel: () => {},
    // eslint-disable-next-line no-console
    onError: msg => console.error(msg),
    onRemoveMessage: () => {},
    onSubmit: () => true,
    submit: {}
  };

  constructor(...args) {
    super(...args);
    this.state = {
      isWaiting: false
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props || nextState !== this.state;
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    e.persist();
    const input = e.target.textarea;
    this.setState({ isWaiting: true });

    let success = false;
    try {
      success = await this.props.onSubmit(input.value);
    } catch (e) {
      this.props.onError(e.message);
    }

    if (success) {
      input.value = '';
      this.props.onCancel();
    }

    this.setState({ isWaiting: false });
  };

  handleKeyDown = (e) => {
    const ENTER = 13;
    if (e.ctrlKey || e.metaKey) {
      if (e.keyCode === ENTER) {
        const submit = new Event('submit');
        this.form.dispatchEvent(submit);
      }
    }
  };

  render() {
    const { messages } = this.props;

    const cancel = omit(this.props.cancel, ['className']);
    const input = omit(this.props.input, ['className']);
    const submit = omit(this.props.submit, ['className']);

    return (
      <BasicRiverItem
        className="river-item--type_text"
        icon={this.props.icon}
        menuItems={this.props.menuItems}
      >
        <form
          className={classNames('create-river-item', this.props.className)}
          ref={c => this.form = c}
          onKeyDown={this.handleKeyDown}
          onSubmit={this.handleSubmit}
        >
          <div className="layout__row">
            <textarea
              className={classNames(
                'input input-block create-river-item__input',
                this.props.input.className
              )}
              name="textarea"
              {...input}
            />
          </div>
          <div className="layout__row">
            <Button
              className={classNames(
                'layout__grid_item',
                this.props.submit.className
              )}
              color="green"
              disabled={this.state.isWaiting}
              size="midi"
              title="Add"
              type="submit"
              {...submit}
            />
            {!cancel.hide &&
              <Button
                className={classNames(
                  'layout__grid_item',
                  this.props.cancel.className
                )}
                color="transparent"
                title="Cancel"
                onClick={this.props.onCancel}
                {...cancel}
              />
            }
          </div>
        </form>
        {messages && messages.size &&
          <Messages
            messages={messages}
            removeMessage={this.props.onRemoveMessage}
          />
        }
      </BasicRiverItem>
    );
  }
}
