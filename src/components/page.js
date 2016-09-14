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

const applyV2 = (needV2, className) => {
  if (needV2) {
    return 'v2-'.concat(className.trim());
  }

  return className;
};

const Page = ({ children, className = '', v2 }) => (
  <div className={applyV2(v2,`page__container ${className}`)}>
    {children}
  </div>
);

const PageCaption = ({ children, v2 }) => (
  <header className={applyV2(v2, 'page__caption')}>
    <h1>{children}</h1>
  </header>
);

const PageHero = ({ children, url, v2 }) => (
  <div className={applyV2(v2, 'page__hero')}>
    <div className={applyV2(v2, 'page__hero_body')}>
      <div
        className={applyV2(v2, 'page__hero_content')}
        style={{ backgroundImage: `url(${url})` }}
      >
        {children}
      </div>
    </div>
  </div>
);

const PageMain = ({ children, className = '', v2, ...props }) => (
  <div className={applyV2(v2, `page__main col col-xs col-s-12 col-m-13 col-l-17 col-xl-19 ${className}`)} {...props}>
    {children}
  </div>
);

const PageBody = ({ children, className = '', v2, ...props }) => (
  <div className={applyV2(v2, `page__body ${className}`)} {...props}>
    {children}
  </div>
);

const PageContent = ({ children, className = '', v2 }) => (
  <div className={applyV2(v2, `page__content col col-xs col-s-19-h col-m-19-h col-l-19-h col-xl-10 ${className}`)}>
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
