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

export async function openOauthPopup(provider, options = {}) {
  return new Promise(function (resolve, reject) {
    window.oauthCallback = function (context) {
      resolve(context);
    };

    let uri;
    if (options.onlyProfile) {
      uri = getProviderProfileUri(provider);
    } else {
      uri = getProviderUri(provider);
    }

    // TODO: Better support for mobile
    const popup = window.open(
      uri,
      '_blank',
      'centerscreen,toolbar=0,scrollbars=1,status=1,resizable=1,location=0,menuBar=0,width=600,height=800'
    );

    if (popup) {
      popup.focus();
    } else {
      reject(new Error('Could not open authentication window'));
    }
  });
}

function getProviderUri(provider) {
  switch (provider) {
    case 'facebook': return '/api/v1/auth/facebook';
    case 'google': return '/api/v1/auth/google';
    case 'twitter': return '/api/v1/auth/twitter';
    case 'github': return '/api/v1/auth/github';
    default: throw Error(`Unknown auth provider "${provider}"`);
  }
}

function getProviderProfileUri(provider) {
  switch (provider) {
    case 'facebook': return '/api/v1/auth/profile/facebook';
    case 'google': return '/api/v1/auth/profile/google';
    case 'twitter': return '/api/v1/auth/profile/twitter';
    case 'github': return '/api/v1/auth/profile/github';
    default: throw Error(`Unknown auth provider "${provider}"`);
  }
}
