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
import { fromJS, List } from 'immutable';
import type { Map } from 'immutable';
import { isEmpty, isString } from 'lodash';

export function getName(user: Map<string, string>) {
  const fullName = user.get('fullName');
  if (isString(fullName) && !isEmpty(fullName.trim())) {
    return fullName;
  }

  return user.get('username');
}

const SERVICES_SEQ = [
  ['facebook', { icon: 'facebook-official' }],
  ['twitter', { icon: 'twitter-square' }],
  ['youtube', { icon: 'youtube-square' }],
  ['googlePlus', { icon: 'google-plus-square' }],
  ['linkedin', { icon: 'linkedin-square' }],
  ['website', { icon: 'chain', className: 'suggested-user__social suggested-user__social--smaller' }]
];

export function parseSocial(social: ?Map<string, string>) {
  if (!social) {
    return List();
  }

  const presentSocial = social; // hack for flow to make it recognize the early return.
  const entries = SERVICES_SEQ.map((s) => {
    const [name, props] = s;
    const url = presentSocial.get(name);

    if (!url) {
      return null;
    }

    return {
      to: url,
      ...props
    };
  });

  return fromJS(entries.filter(Boolean));
}
