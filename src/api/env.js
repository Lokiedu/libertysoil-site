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
const isTest = ['test', 'travis'].includes(process.env.DB_ENV);
// Using any string as a key doesn't throw an error in passport strategies which may be useful for tests.
export const none = (isTest && 'none');

export const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || none;
export const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || none;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || none;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || none;
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || none;
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || none;
export const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY || none;
export const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET || none;
