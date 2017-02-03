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
import { Map as ImmutableMap } from 'immutable';
import { throttle, take } from 'lodash';
import classNames from 'classnames';

import { convertModelsToTags } from '../utils/tags';
import Tag from './tag';

// TODO: consider effeciency of using 'only' property
export default class TagCloud extends Component {
  static displayName = 'TagCloud';

  static propTypes = {
    className: PropTypes.string,
    only: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.shape({})
  };

  static defaultProps = {
    only: [],
    tags: ImmutableMap({})
  };

  constructor(props) {
    super(props);

    this.state = {
      visibleTags: 0
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resetVisibleTags);
    document.addEventListener('DOMContentLoaded', this.resetVisibleTags);
    this.resetVisibleTags();
  }

  componentWillReceiveProps(nextProps) {
    this.resetVisibleTags(null, nextProps);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resetVisibleTags);
    document.removeEventListener('DOMContentLoaded', this.resetVisibleTags);
  }

  resetVisibleTags = throttle((_, nextProps) => {
    let props = nextProps;
    if (!props) {
      props = this.props;
    }

    const { tags, smartCollapsing } = props;
    if (!smartCollapsing) {
      return;
    }

    this.setState({
      visibleTags: convertModelsToTags(tags).length
    }, this.updateVisibleTags);
  }, 100);

  updateVisibleTags = () => {
    const rootWidth = this._root.offsetWidth;
    const bodyWidth = this._body.offsetWidth;

    if (bodyWidth >= rootWidth) {
      if (this.state.visibleTags > 1) {
        this.setState({
          visibleTags: this.state.visibleTags - 1
        }, this.updateVisibleTags);
      }
    }
  };

  render() {
    const {
      className,
      only,
      tags,
      smartCollapsing,
      ...props
    } = this.props;

    let requiredTags = tags;
    if (only.length > 0) {
      requiredTags = tags.filter((value, key) => only.includes(key));
    }

    let preparedTags = convertModelsToTags(requiredTags)
      .map((tag, index) => (
        <Tag
          key={tag.id || index}
          {...tag}
          {...props}
        />
      ));

    if (smartCollapsing) {
      preparedTags = take(preparedTags, this.state.visibleTags);
    }

    const cn = classNames('tags', `tags--count_${preparedTags.length}`, className);
    return (
      <div className={cn} ref={c => this._root = c}>
        <div className="tags--body" ref={c => this._body = c}>
          <div className="tags--container">
            {preparedTags}
          </div>
        </div>
      </div>
    );
  }
}
