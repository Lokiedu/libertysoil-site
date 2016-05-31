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
import { truncate } from 'grapheme-utils';


export const DESCRIPTION_LIMIT = 140;

export default class TagDescription extends React.Component {
  static propTypes = {
    description: PropTypes.string
  };

  state = {
    expanded: false
  };

  handleClickOnExpand = () => {
    this.setState({
      expanded: true
    });
  };

  render() {
    const description = this.props.description || '';
    const expanded = this.state.expanded;
    const long = description.length > DESCRIPTION_LIMIT;

    let linesOfDescription;
    if (!description.length) {
      linesOfDescription = <p>No information provided...</p>;
    } else if (long && !expanded) {
      linesOfDescription = truncate(description, { length: DESCRIPTION_LIMIT });
    } else {
      linesOfDescription = description.split("\n").map((line, i) => <p key={`tag-${i}`}>{line}</p>);
    }

    return (
      <div>
        {linesOfDescription}
        <span>&nbsp;</span>
        {long && !expanded &&
          <a className="link" href="javascript:;" onClick={this.handleClickOnExpand}>show more</a>
        }
      </div>
    );
  }
}
