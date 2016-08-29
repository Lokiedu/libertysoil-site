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
import { Link } from 'react-router';

import { toolsMenu } from '../../utils/menu';
import Breadcrumbs from '../../components/breadcrumbs/breadcrumbs';
import HeaderLogo from '../../components/header-logo';
import Menu1 from '../../components/tools/menu-1';
import Menu2 from '../../components/tools/menu-2';


const BaseToolsPage = ({ children, location }) => {
  const currentPath = location.pathname;
  const currentMenuItem = toolsMenu.getCurrent(currentPath);

  if (!currentMenuItem) {
    return <div>{currentPath}</div>;
  }

  return (
    <div className="tools_page">
      <header className="header page__header">
        <div className="header__body">
          <div className="header__content">
            <HeaderLogo small />
            <Breadcrumbs>
              <Link to="/">Back</Link>
            </Breadcrumbs>
          </div>
        </div>
      </header>

      <div className="tools_page__body">
        <div className="tools_page__menu-col">
          <Menu1 currentPath={currentPath} />
          <Menu2 currentPath={currentPath} />
        </div>
        <div className="tools_page__content-col">
          <div className="tools_page__header tools_page__header-current">{currentMenuItem.name}</div>
          <div className="tools_page__content">
            {children}
          </div>
        </div>
      </div>

      <footer className="tools_page__footer">
        {/* TODO: Create footer classes? */}
        <div className="header__body">
          <div className="header__content">
            <HeaderLogo small />
          </div>
        </div>
      </footer>
    </div>
  );
};

BaseToolsPage.displayName = 'BaseToolsPage';

BaseToolsPage.propTypes = {
  children: PropTypes.node,
  location: PropTypes.shape({
    pathname: PropTypes.string
  })
};

export default BaseToolsPage;
