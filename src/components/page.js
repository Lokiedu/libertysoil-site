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
  PageHero,
  PageCaption,
  PageBody,
  PageContent
};
