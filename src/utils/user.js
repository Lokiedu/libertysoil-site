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
// @flow
import { List } from 'immutable';
import type { Map as ImmutableMap } from 'immutable';
import { isEmpty, isString } from 'lodash';

import type { Props as OldIconProps } from '../components/icon/templates/old';
import type { Url } from '../definitions/common';

export function getName(user: ImmutableMap<string, string>): string {
  const fullName = user.get('fullName');
  if (isString(fullName) && !isEmpty(fullName.trim())) {
    return fullName;
  }

  return user.get('username');
}

const SUPPORTED_SERVICES: { [key: string]: OldIconProps } = {
  facebook: { icon: 'facebook-official' },
  googlePlus: { icon: 'google-plus-square' },
  linkedin: { icon: 'linkedin-square' },
  twitter: { icon: 'twitter-square' },
  youtube: { icon: 'youtube-square' },
  website: {
    icon: 'chain',
    className: 'suggested-user__social suggested-user__social--smaller'
  }
};

type LinkedIconProps = OldIconProps & { to: string };

export function parseSocial(
  social: ?ImmutableMap<string, string>
): List<LinkedIconProps> {
  if (!social) {
    return List();
  }

  return social.reduce((
    acc: List<LinkedIconProps>,
    url: Url,
    serviceName: string
  ): List<LinkedIconProps> => {
    if (!url || !(serviceName in SUPPORTED_SERVICES)) {
      return acc;
    }

    return acc.push({
      to: url,
      ...SUPPORTED_SERVICES[serviceName]
    });
  }, List());
}
