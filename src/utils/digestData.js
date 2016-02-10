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
import initBookshelf from '../api/db';
import db_config from '../../knexfile';

let exec_env = process.env.DB_ENV || 'development';
const knexConfig = db_config[exec_env];
let bookshelf = initBookshelf(knexConfig);

export default async function (){

    let User = bookshelf.model('User');
    console.log(User);
    let u = await User
        .where('email_check_hash', '')
        .fetchAll({
            require: true,
            withRelated: [
                'following',
                'favourited_posts', 'followed_labels',
                'followed_schools', 'followed_geotags'
            ]
        });
    return u;
}