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
import { throttle } from 'lodash';

const Page = ({ children, className = '' }) => (
  <div className={`page__container ${className}`}>
    {children}
  </div>
);

const PageCaption = ({ children }) => (
  <header className="page__caption">
    <h1>{children}</h1>
  </header>
);

export class PageHero extends React.Component {
  static displayName = 'PageHero'

  state = {
    left: null
  };

  onResize = throttle(() => {
    const { left, width } = this.props.crop;
    const viewWidth = window.innerWidth;
    const l = (width - viewWidth) / 2 + left;

    this.setState({ left: l });
  }, 60);

  componentWillReceiveProps(nextProps) {
    if (window) {
      if (nextProps.crop) {
        window.addEventListener('resize', this.onResize);
      } else {
        window.removeEventListener('resize', this.onResize);
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);     
  }

  render() {
    const { children, src, crop } = this.props;

    let style = { backgroundImage: `url(${src})` };
    if (crop) {
      if (typeof this.state.left === 'object') {
        this.onResize();
      }

      style.backgroundPosition = `-${this.state.left}px -${crop.top}px`;
      style.backgroundSize = 'auto';
    }

    return (
      <div className="page__hero">
        <div className="page__hero_body">
          <div className="page__hero_content" style={style}>
            {children}
          </div>
        </div>
      </div>
    );
  }
}


const PageMain = ({ children, className = '', ...props }) => (
  <div className={`page__main ${className}`} {...props}>
    {children}
  </div>
);

const PageBody = ({ children, className = '', ...props }) => (
  <div className={`page__body ${className}`} {...props}>
    {children}
  </div>
);

const PageContent = ({ children, className = '' }) => (
  <div className={`page__content ${className}`}>
    {children}
  </div>
);

export {
  Page,
  PageMain,
  PageCaption,
  PageBody,
  PageContent
}
