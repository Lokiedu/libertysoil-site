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
import classNames from 'classnames';
import { isString } from 'lodash';


const Page = ({ children, className = '' }) => (
  <div className={classNames('page__container', className)}>
    {children}
  </div>
);

const PageCaption = ({ children, iconLeft, iconRight }) => {
  let title = children;
  if (isString(children)) {
    title = <h1 className="page-head__title">{children}</h1>;
  }

  return (
    <header className="page-head">
      {iconLeft &&
        <div className="page-head__icon">
          {iconLeft}
        </div>
      }
      <div className="page-head__title-wrapper">
        {title}
      </div>
      {iconRight &&
        <div className="page-head__icon">
          {iconRight}
        </div>
      }
    </header>
  );
};

const PageHero = ({ children, contentClassName, url }) => (
  <div className="page__hero">
    <div className="page__hero_body">
      <div
        className={classNames('page__hero_content', contentClassName)}
        style={{
          backgroundImage: `url(${url})`
        }}
      >
        {children}
      </div>
    </div>
  </div>
);


const PageMain = ({ children, className, ...props }) => (
  <div className={classNames('page__main', className)} {...props}>
    {children}
  </div>
);

const PageBody = ({ children, className, ...props }) => (
  <div className={classNames('page__body', className)} {...props}>
    {children}
  </div>
);

class PageContent extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const { children, className } = this.props;
    return (
      <div className={classNames('page__content', className)}>
        {children}
      </div>
    );
  }
}

export {
  Page,
  PageMain,
  PageHero,
  PageCaption,
  PageBody,
  PageContent
};
