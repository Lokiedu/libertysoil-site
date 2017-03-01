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
import React from 'react';
import { Link } from 'react-router';
import isNil from 'lodash/isNil';

function move(nextOffset, location) {
  return {
    ...location,
    query: {
      ...location.query,
      offset: nextOffset
    }
  };
}

export default class SearchPaging extends React.Component {
  static defaultProps = {
    offset: 0,
    resultsPerPage: 20
  };

  prev = location => {
    const { offset, resultsPerPage } = this.props;
    if (offset <= resultsPerPage) {
      return move(0, location);
    }
    return move(offset - resultsPerPage, location);
  };

  next = location => {
    const { offset, resultsPerPage } = this.props;
    return move(offset + resultsPerPage, location);
  };

  render() {
    const { limit, offset, resultsPerPage } = this.props;

    let prevOffset = 0;
    if (offset > resultsPerPage) {
      prevOffset = offset - resultsPerPage;
    }

    let prevDescription;
    if (prevOffset == 0) {
      prevDescription = 'First '.concat(offset - prevOffset);
    } else {
      prevDescription = 'Previous '.concat(resultsPerPage);
    }

    const nextOffset = offset + resultsPerPage;
    let nextDescription;
    if (!isNil(limit) && limit - nextOffset <= resultsPerPage) {
      nextDescription = 'Last '.concat(limit - nextOffset);
    } else {
      nextDescription = 'Next '.concat(resultsPerPage);
    }

    return (
      <div className="search__paging">
        {offset !== 0 &&
          <Link
            className="search__paging-item"
            onClick={this.props.onPageChange}
            to={this.prev}
          >
            {prevDescription}
          </Link>
        }
        {(!limit || nextOffset < limit) &&
          <Link
            className="search__paging-item"
            onClick={this.props.onPageChange}
            to={this.next}
          >
            {nextDescription}
          </Link>
        }
      </div>
    );
  }
}
