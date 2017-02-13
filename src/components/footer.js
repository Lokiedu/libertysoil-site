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

const FooterComponent = () => (
  <footer className="page__footer footer">
    {false &&
      <nav className="footer_nav">
        <a href="#">About</a>
        <a href="#">FAQ</a>
        <a href="#">Terms of service</a>
        <a href="#">Privacy policy</a>
      </nav>
    }
    <p>
      <a href="mailto:info@libertysoil.org">info@libertysoil.org</a>
    </p>
    <p>
      <a href="https://github.com/Lokiedu/libertysoil-site/milestones">Version 1.9.2</a>
    </p>
    <script async data-trackduck-id="56182f159e7749be13765442" src="//d1ks1friyst4m3.cloudfront.net/toolbar/prod/td.js" />
  </footer>
);

FooterComponent.displayName = 'FooterComponent';

export default FooterComponent;
