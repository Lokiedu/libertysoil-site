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
import GeotagFactory from '../../../../test-helpers/factories/geotag';
import PostFactory from '../../../../test-helpers/factories/post';
import SchoolFactory from '../../../../test-helpers/factories/school';
import HashtagFactory from '../../../../test-helpers/factories/hashtag';
import initBookshelf from '../../../../src/api/db';


const bookshelf = initBookshelf($dbConfig);
const Geotag = bookshelf.model('Geotag');
const Post = bookshelf.model('Post');
const School = bookshelf.model('School');
const Hashtag = bookshelf.model('Hashtag');

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

  describe('geotags', () => {
    let geotags = [];
    let geotagIds = [];

    before(async () => {
      for (let i = 0; i < 2; ++i) {
        let geotag = await new Geotag(GeotagFactory.build()).save(null, { method: 'insert' });
        await geotag.refresh();
        geotags.push(geotag);
        geotagIds.push(geotag.id);
      }
    });

    after(() => {
      for (let geotag of geotags) {
        geotag.destroy();
      }
    });

    afterEach(async () => {
      await post.geotags().detach(geotagIds);

      for (let geotag of geotags) {
        await geotag.save({ post_count: 0 });
      }
    });

    describe('#attachGeotags', () => {
      it('increments post_count', async () => {
        expect(geotags[0].get('post_count'), 'to equal', 0);

        await post.attachGeotags(geotagIds);
        await geotags[0].refresh();
        expect(geotags[0].get('post_count'), 'to equal', 1);
      });
    });

    describe('#detachGeotags', () => {
      it('decrements post_count', async () => {
        await post.attachGeotags(geotagIds);
        await geotags[0].refresh();
        expect(geotags[0].get('post_count'), 'to equal', 1);

        await post.detachGeotags(geotagIds);
        await geotags[0].refresh();
        expect(geotags[0].get('post_count'), 'to equal', 0);
      });
    });

    describe('#updateGeotags', () => {
      it('sets correct post_count', async () => {
        await post.updateGeotags(geotagIds);

        for (let geotag of geotags) {
          await geotag.refresh();
          expect(geotag.get('post_count'), 'to equal', 1);
        }

        let newGeotag = await new Geotag(GeotagFactory.build()).save(null, { method: 'insert' });
        await post.updateGeotags([newGeotag.id]);

        for (let geotag of geotags) {
          await geotag.refresh();
          expect(geotag.get('post_count'), 'to equal', 0);
        }

        await newGeotag.refresh();
        expect(newGeotag.get('post_count'), 'to equal', 1);

        newGeotag.destroy();
      });
    });
  });

  describe('schools', () => {
    let schools = [];
    let schoolNames = [];

    before(async () => {
      for (let i = 0; i < 2; ++i) {
        let school = await new School(SchoolFactory.build()).save(null, { method: 'insert' });
        await school.refresh();
        schools.push(school);
        schoolNames.push(school.get('name'));
      }
    });

    after(() => {
      for (let school of schools) {
        school.destroy();
      }
    });

    afterEach(async () => {
      await post.schools().detach(schools.map(school => school.id));

      for (let school of schools) {
        await school.save({ post_count: 0 });
      }
    });

    describe('#attachSchools', () => {
      it('increments post_count', async () => {
        expect(schools[0].get('post_count'), 'to equal', 0);

        await post.attachSchools(schoolNames);
        await schools[0].refresh();
        expect(schools[0].get('post_count'), 'to equal', 1);
      });
    });

    describe('#detachSchools', () => {
      it('decrements post_count', async () => {
        await post.attachSchools(schoolNames);
        await schools[0].refresh();
        expect(schools[0].get('post_count'), 'to equal', 1);

        await post.detachSchools(schoolNames);
        await schools[0].refresh();
        expect(schools[0].get('post_count'), 'to equal', 0);
      });
    });

    describe('#updateSchools', () => {
      it('sets correct post_count', async () => {
        await post.updateSchools(schoolNames);

        for (let school of schools) {
          await school.refresh();
          expect(school.get('post_count'), 'to equal', 1);
        }

        let newSchool = await new School(SchoolFactory.build()).save(null, { method: 'insert' });
        await post.updateSchools([newSchool.get('name')]);

        for (let school of schools) {
          await school.refresh();
          expect(school.get('post_count'), 'to equal', 0);
        }

        await newSchool.refresh();
        expect(newSchool.get('post_count'), 'to equal', 1);

        newSchool.destroy();
      });
    });
  });

  describe('hashtags', () => {
    let hashtags = [];
    let hashtagNames = [];

    before(async () => {
      for (let i = 0; i < 2; ++i) {
        let hashtag = await new Hashtag(HashtagFactory.build()).save(null, { method: 'insert' });
        await hashtag.refresh();
        hashtags.push(hashtag);
        hashtagNames.push(hashtag.get('name'));
      }
    });

    after(() => {
      for (let hashtag of hashtags) {
        hashtag.destroy();
      }
    });

    afterEach(async () => {
      await post.hashtags().detach(hashtags.map(hashtag => hashtag.id));

      for (let hashtag of hashtags) {
        await hashtag.save({ post_count: 0 });
      }
    });

    describe('#attachHashtags', () => {
      it('increments post_count', async () => {
        expect(hashtags[0].get('post_count'), 'to equal', 0);

        await post.attachHashtags(hashtagNames);
        await hashtags[0].refresh();
        expect(hashtags[0].get('post_count'), 'to equal', 1);
      });
    });

    describe('#detachHashtags', () => {
      it('decrements post_count', async () => {
        await post.attachHashtags(hashtagNames);
        await hashtags[0].refresh();
        expect(hashtags[0].get('post_count'), 'to equal', 1);

        await post.detachHashtags(hashtagNames);
        await hashtags[0].refresh();
        expect(hashtags[0].get('post_count'), 'to equal', 0);
      });
    });

    describe('#updateHashtags', () => {
      it('sets correct post_count', async () => {
        await post.updateHashtags(hashtagNames);

        for (let hashtag of hashtags) {
          await hashtag.refresh();
          expect(hashtag.get('post_count'), 'to equal', 1);
        }

        let newHashtag = await new Hashtag(HashtagFactory.build()).save(null, { method: 'insert' });
        await post.updateHashtags([newHashtag.get('name')]);

        for (let hashtag of hashtags) {
          await hashtag.refresh();
          expect(hashtag.get('post_count'), 'to equal', 0);
        }

        await newHashtag.refresh();
        expect(newHashtag.get('post_count'), 'to equal', 1);

        newHashtag.destroy();
      });
    });
  });
});