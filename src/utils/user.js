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
import { fromJS, List } from 'immutable';

export function getName(user) {
  const fullName = user.get('fullName');
  if (fullName === ' ') {
    return user.get('username');
  }

  return fullName;
}

const SERVICES_SEQ = [
  ['facebook', { icon: 'facebook-official' }],
  ['twitter', { icon: 'twitter-square' }],
  ['youtube', { icon: 'youtube-square' }],
  ['googlePlus', { icon: 'google-plus-square' }],
  ['linkedin', { icon: 'linkedin-square' }],
  ['website', { icon: 'chain', className: 'suggested-user__social suggested-user__social--smaller' }]
];

export function parseSocial(social) {
  if (!social) {
    return List();
  }

  const entries = [];
  // eslint-disable-next-line no-var
  for (var s, url, i = 0, l = SERVICES_SEQ.length; i < l; ++i) {
    s = SERVICES_SEQ[i];
    url = social.get(s[0]);
    if (url) {
      entries.push({
        to: url,
        ...s[1]
      });
    }
  }
  return fromJS(entries);
}
