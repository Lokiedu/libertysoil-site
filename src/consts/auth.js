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
// Defined in the webpack config
export const FACEBOOK_AUTH_ENABLED = process.env.FACEBOOK_AUTH_ENABLED;
export const GOOGLE_AUTH_ENABLED = process.env.GOOGLE_AUTH_ENABLED;
export const TWITTER_AUTH_ENABLED = process.env.TWITTER_AUTH_ENABLED;
export const GITHUB_AUTH_ENABLED = process.env.GITHUB_AUTH_ENABLED;
export const ANY_OAUTH_ENABLED = FACEBOOK_AUTH_ENABLED ||
  GOOGLE_AUTH_ENABLED ||
  TWITTER_AUTH_ENABLED ||
  GITHUB_AUTH_ENABLED;
