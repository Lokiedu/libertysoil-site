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

const Page = ({ children, className = '' }) => (
  <div className={classNames('page__container', className)}>
    {children}
  </div>
);

const PageCaption = ({ children, icon }) => (
  <header className="page_head">
    <h1 className="page_head__title">
      {children}
    </h1>
    {icon &&
      <div className="page_head__icon">
        {icon}
      </div>
    }
  </header>
);

const PageHero = ({ children, url }) => (
  <div className="page__hero">
    <div className="page__hero_body">
      <div
        className="page__hero_content"
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
