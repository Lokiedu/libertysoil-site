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
/* eslint-env node, mocha */
/* global $dbConfig */
import expect from '../../../../test-helpers/expect';
import PostFactory from '../../../../test-helpers/factories/post';
import SchoolFactory from '../../../../test-helpers/factories/school';
import initBookshelf from '../../../../src/api/db';


let bookshelf = initBookshelf($dbConfig);
let Post = bookshelf.model('Post');
let School = bookshelf.model('School');

describe('Post', () => {
  let post, school;

  before(async () => {
    post = await new Post(PostFactory.build({})).save(null, {method: 'insert'});
    school = await new School(SchoolFactory.build({updated_at: null})).save(null, {method: 'insert'});
  });

  after(() => {
    post.destroy();
    school.destroy();
  });

  it('attachSchool updates school updated_at field', async () => {
    await school.refresh(); // refrsesh from database
    expect(school.get('updated_at'), 'to be null');
    await post.attachSchools(school.get('name'));

    await school.refresh();
    expect(school.get('updated_at'), 'not to be null');
  });
});
