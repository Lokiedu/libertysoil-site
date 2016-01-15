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
import React, { PropTypes, Component } from 'react';


export default class AddHashtagForm extends Component {
  static displayName = 'AddHashtagForm';

  static propTypes = {
    addedHashtags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })).isRequired,
    onAddHashtag: PropTypes.func.isRequired
  };

  _handleAddTag = (event) => {
    event.preventDefault();

    let { addedHashtags } = this.props;
    let tagName = this.refs.input.value.trim();

    if (tagName.length < 3) {
      return;
    }

    if (addedHashtags.find(tag => tag.name === tagName)) {
      return;
    }

    this.refs.input.value = '';

    this.props.onAddHashtag({name: tagName});
  };

  render() {
    return (
      <div className="add_tag_modal add_tag_modal-hashtag">
        <div className="add_tag_modal__tabs">
          <div className="add_tag_modal__tab add_tag_modal__tab-active">Enter manually</div>
        </div>

        <div>
          <div className="layout__row add_tag_modal__tab_panel">
            <div className="layout">
              <div className="layout__grid_item layout__grid_item-wide">
                <form onSubmit={this._handleAddTag}>
                  <input
                    className="input input-block input-transparent input-button_height"
                    placeholder="Start typing..."
                    ref="input"
                    type="text"
                    maxLength="72"
                  />
                </form>
              </div>
              <div className="layout__grid_item">
                  <span
                    className="button button-wide add_tag_modal__add_button action"
                    onClick={this._handleAddTag}
                  >
                    Add
                  </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}
