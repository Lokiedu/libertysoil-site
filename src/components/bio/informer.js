/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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
import Link from 'react-router/lib/Link';

import { OldIcon as Icon } from '../icon';
import BasicRiverItem from '../river/theme/basic';

const ICON_SIZE = { inner: 'xl', outer: 'l' };

export default function YourBioInformer({ username }) {
  return (
    <BasicRiverItem
      className="river-item--type_text bio__informer"
      icon={
        <Icon
          className="bio__icon bio__icon--bordered bio__informer-icon"
          icon="exclamation-circle"
          pack="fa"
          size={ICON_SIZE}
        />
      }
    >
      <div className="bio__informer-text bio__informer-text--note_red">
        Click here to see your bio the way visitors see it:<br />
        <Link
          className="color-dark_blue bio__informer-link"
          to={'/user/'.concat(username).concat('/bio')}
        >
          @{username}
        </Link>
      </div>
    </BasicRiverItem>
  );
}
