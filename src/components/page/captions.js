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

import { getName } from '../../utils/user';
import Avatar from '../user/avatar';
import { OldIcon as Icon } from '../icon';
import {
  PageCaption
} from '../page';

const ICON_SIZE = { inner: 'ml', outer: 'm' };

export const UserCaption = ({ user, title, subtitle }) => {
  if (!user) {
    return (
      <PageCaption />
    );
  }

  return (
    <PageCaption
      iconLeft={<Avatar user={user} isRound={false} size={60} />}
      iconRight={<Icon color="white" icon="at" outline="khaki" size={ICON_SIZE} />}
    >
      <h2 className="page-head__title">{title || user.get('username')}</h2>
      <h1 className="page-head__subtitle">{subtitle || getName(user)}</h1>
    </PageCaption>
  );
};

UserCaption.propTypes = {
  subtitle: PropTypes.node,
  title: PropTypes.node
};
