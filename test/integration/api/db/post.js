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
import expect from '../../../../test-helpers/expect';
import { createUser } from '../../../../test-helpers/factories/user';
import { createGeotag } from '../../../../test-helpers/factories/geotag';
import { createPost } from '../../../../test-helpers/factories/post';
import { createSchool } from '../../../../test-helpers/factories/school';
import { createHashtag } from '../../../../test-helpers/factories/hashtag';


describe('Post', () => {
  let post, school, user;

  before(async () => {
    user = await createUser();
    post = await createPost({ user_id: user.id });
    school = await createSchool({ updated_at: null });
  });

  after(async () => {
    await post.destroy();
    await school.destroy();
    await user.destroy();
  });

  it('attachSchool updates school updated_at field', async () => {
    await school.refresh();
    expect(school.get('updated_at'), 'to be null');
    await post.attachSchools(school.get('name'));

    await school.refresh();
    expect(school.get('updated_at'), 'not to be null');
  });

  describe('geotags', () => {
    const geotags = [];
    const geotagIds = [];
    let continent, country, city;


    before(async () => {
      continent = await createGeotag({ type: 'Continent' });
      country = await createGeotag({
        type: 'Country',
        continent_id: continent.id
      });
      city = await createGeotag({
        type: 'City',
        continent_id: continent.id,
        country_id: country.id
      });

      for (let i = 0; i < 2; ++i) {
        const geotag = await createGeotag();
        await geotag.refresh();
        geotags.push(geotag);
        geotagIds.push(geotag.id);
      }
    });

    after(async () => {
      for (const geotag of geotags) {
        await geotag.destroy();
      }

      await city.destroy();
      await country.destroy();
      await continent.destroy();
    });

    afterEach(async () => {
      const allGeotags = geotags.concat(continent, country, city);
      await post.geotags().detach(allGeotags.map(t => t.id));

      for (const geotag of allGeotags) {
        await geotag.save({ post_count: 0, hierarchy_post_count: 0 });
      }
    });

    describe('#attachGeotags', () => {
      it('increments post_count', async () => {
        expect(geotags[0].get('post_count'), 'to equal', 0);

        await post.attachGeotags(geotagIds);
        await geotags[0].refresh();
        expect(geotags[0].get('post_count'), 'to equal', 1);
      });

      it('increments hierarchy_post_count for all parents', async () => {
        expect(continent.attributes, 'to satisfy', { hierarchy_post_count: 0 });
        expect(country.attributes, 'to satisfy', { hierarchy_post_count: 0 });
        expect(city.attributes, 'to satisfy', { hierarchy_post_count: 0 });

        await post.attachGeotags([city.id]);

        await continent.refresh();
        expect(continent.attributes, 'to satisfy', { hierarchy_post_count: 1 });
        await country.refresh();
        expect(country.attributes, 'to satisfy', { hierarchy_post_count: 1 });
        await city.refresh();
        expect(city.attributes, 'to satisfy', { hierarchy_post_count: 1 });
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


      it('decrements hierarchy_post_count for all parents', async () => {
        await post.attachGeotags([city.id]);

        await continent.refresh();
        expect(continent.attributes, 'to satisfy', { hierarchy_post_count: 1 });
        await country.refresh();
        expect(country.attributes, 'to satisfy', { hierarchy_post_count: 1 });
        await city.refresh();
        expect(city.attributes, 'to satisfy', { hierarchy_post_count: 1 });

        await post.detachGeotags([city.id]);

        await continent.refresh();
        expect(continent.attributes, 'to satisfy', { hierarchy_post_count: 0 });
        await country.refresh();
        expect(country.attributes, 'to satisfy', { hierarchy_post_count: 0 });
        await city.refresh();
        expect(city.attributes, 'to satisfy', { hierarchy_post_count: 0 });
      });
    });

    describe('#updateGeotags', () => {
      it('sets correct post_count', async () => {
        await post.updateGeotags(geotagIds);

        for (const geotag of geotags) {
          await geotag.refresh();
          expect(geotag.get('post_count'), 'to equal', 1);
        }

        const newGeotag = await createGeotag();
        await post.updateGeotags([newGeotag.id]);

        for (const geotag of geotags) {
          await geotag.refresh();
          expect(geotag.get('post_count'), 'to equal', 0);
        }

        await newGeotag.refresh();
        expect(newGeotag.get('post_count'), 'to equal', 1);

        await newGeotag.destroy();
      });
    });
  });

  describe('schools', () => {
    const schools = [];
    const schoolNames = [];

    before(async () => {
      for (let i = 0; i < 2; ++i) {
        const school = await createSchool();
        await school.refresh();
        schools.push(school);
        schoolNames.push(school.get('name'));
      }
    });

    after(async () => {
      for (const school of schools) {
        await school.destroy();
      }
    });

    afterEach(async () => {
      await post.schools().detach(schools.map(school => school.id));

      for (const school of schools) {
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

        for (const school of schools) {
          await school.refresh();
          expect(school.get('post_count'), 'to equal', 1);
        }

        const newSchool = await createSchool();
        await post.updateSchools([newSchool.get('name')]);

        for (const school of schools) {
          await school.refresh();
          expect(school.get('post_count'), 'to equal', 0);
        }

        await newSchool.refresh();
        expect(newSchool.get('post_count'), 'to equal', 1);

        await newSchool.destroy();
      });
    });
  });

  describe('hashtags', () => {
    const hashtags = [];
    const hashtagNames = [];

    before(async () => {
      for (let i = 0; i < 2; ++i) {
        const hashtag = await createHashtag();
        await hashtag.refresh();
        hashtags.push(hashtag);
        hashtagNames.push(hashtag.get('name'));
      }
    });

    after(async () => {
      for (const hashtag of hashtags) {
        await hashtag.destroy();
      }
    });

    afterEach(async () => {
      await post.hashtags().detach(hashtags.map(hashtag => hashtag.id));

      for (const hashtag of hashtags) {
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

        for (const hashtag of hashtags) {
          await hashtag.refresh();
          expect(hashtag.get('post_count'), 'to equal', 1);
        }

        const newHashtag = await createHashtag();
        await post.updateHashtags([newHashtag.get('name')]);

        for (const hashtag of hashtags) {
          await hashtag.refresh();
          expect(hashtag.get('post_count'), 'to equal', 0);
        }

        await newHashtag.refresh();
        expect(newHashtag.get('post_count'), 'to equal', 1);

        await newHashtag.destroy();
      });
    });
  });
});
