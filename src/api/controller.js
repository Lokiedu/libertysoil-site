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
import crypto from 'crypto';
import { format as format_url, parse as parse_url } from 'url';

import _ from 'lodash';
import bcrypt from 'bcrypt';
import bb from 'bluebird';
import { countBreaks } from 'grapheme-breaker';
import uuid from 'uuid';
import slug from 'slug';
import fetch from 'node-fetch';
import Checkit from 'checkit';

import QueueSingleton from '../utils/queue';
import { hidePostsData } from '../utils/posts';
import { removeWhitespace } from '../utils/lang';
import { processImage as processImageUtil } from '../utils/image';
import config from '../../config';
import { SEARCH_INDEXES_TABLE, SEARCH_RESPONSE_TABLE } from '../consts/search';
import {
  User as UserValidators,
  School as SchoolValidators,
  Hashtag as HashtagValidators,
  Geotag as GeotagValidators,
  UserMessage as UserMessageValidators,
  SearchQuery as SearchQueryValidators
} from './db/validators';

const SUPPORTED_LOCALES = Object.keys(
  require('../consts/localization').SUPPORTED_LOCALES
);

const bcryptAsync = bb.promisifyAll(bcrypt);
const POST_RELATIONS = Object.freeze([
  'user', 'likers', 'favourers', 'hashtags', 'schools',
  'geotags', 'liked_hashtag', 'liked_school', 'liked_geotag',
  { post_comments: qb => qb.orderBy('created_at') }, 'post_comments.user'
]);

const USER_RELATIONS = Object.freeze([
  'following',
  'followers',
  'liked_posts',
  'favourited_posts',
  'followed_hashtags',
  'followed_geotags',
  'followed_schools',
  'liked_hashtags',
  'liked_geotags',
  'liked_schools'
]);

export default class ApiController {
  bookshelf;
  sphinx;
  queue;

  constructor(bookshelf, sphinx) {
    this.bookshelf = bookshelf;
    this.sphinx = { api: bb.promisifyAll(sphinx.api), ql: sphinx.ql };
    this.queue = new QueueSingleton;
  }

  test = async (ctx) => {
    ctx.body = 'test message in response';
  };

  testSphinx = async (ctx) => {
    const indexes = await this.sphinx.ql.raw(`SHOW TABLES`);
    ctx.body = indexes;
  };

  testDelete = async (ctx) => {
    ctx.body = 'test message in delete response';
  };

  testHead = async (ctx) => {
    ctx.body = [];
  };

  testPost = async (ctx) => {
    ctx.body = 'test message in post response';
  };

  allPosts = async (ctx) => {
    const Post = this.bookshelf.model('Post');
    const posts = Post.collection().query(qb => {
      this.applySortQuery(qb, ctx.query, '-created_at');
      this.applyLimitQuery(qb, ctx.query, 5);
      this.applyOffsetQuery(qb, ctx.query);

      if ('continent' in ctx.query) {
        qb
          .distinct('posts.*')
          .join('geotags_posts', 'posts.id', 'geotags_posts.post_id')
          .join('geotags', 'geotags_posts.geotag_id', 'geotags.id')
          .where('geotags.continent_code', ctx.query.continent);
      } else if ('geotags' in ctx.query) {
        qb
          .distinct('posts.*')
          .join('geotags_posts', 'posts.id', 'geotags_posts.post_id');
      }
    });
    let response = await posts.fetch({ require: false, withRelated: POST_RELATIONS });
    response = response.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({ id: row.id, name: row.attributes.name, url_name: row.attributes.url_name }));
      return post;
    });

    response = await hidePostsData(response, ctx, this.bookshelf.knex);
    ctx.body = response;
  };

  userPosts = async (ctx) => {
    const Post = this.bookshelf.model('Post');

    const q = Post.forge()
      .query(qb => {
        qb
          .join('users', 'users.id', 'posts.user_id')
          .where('users.username', '=', ctx.params.user)
          .whereIn('posts.type', ['short_text', 'long_text'])
          .offset(ctx.query.offset);

        if ('limit' in ctx.query) {
          qb.limit(ctx.query.limit);
        }

        this.applySortQuery(qb, ctx.query, '-updated_at');
      });


    let posts = await q.fetchAll({ require: false, withRelated: POST_RELATIONS });

    const post_comments_count = await this.countComments(posts);

    posts = posts.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({ id: row.id, name: row.attributes.name, url_name: row.attributes.url_name }));
      post.attributes.comments = post_comments_count[post.get('id')];
      return post;
    });

    posts = await hidePostsData(posts, ctx, this.bookshelf.knex);
    ctx.body = posts;
  };

  tagPosts = async (ctx) => {
    const Post = this.bookshelf.model('Post');

    const q = Post.forge()
      .query(qb => {
        qb
          .join('hashtags_posts', 'posts.id', 'hashtags_posts.post_id')
          .join('hashtags', 'hashtags_posts.hashtag_id', 'hashtags.id')
          .where('hashtags.name', '=', ctx.params.tag)
          .orderBy('posts.created_at', 'desc');
      });

    let posts = await q.fetchAll({ require: false, withRelated: POST_RELATIONS });

    const post_comments_count = await this.countComments(posts);

    posts = posts.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({ id: row.id, name: row.attributes.name, url_name: row.attributes.url_name }));
      post.attributes.comments = post_comments_count[post.get('id')];
      return post;
    });

    posts = await hidePostsData(posts, ctx, this.bookshelf.knex);
    ctx.body = posts;
  };

  schoolPosts = async (ctx) => {
    const Post = this.bookshelf.model('Post');

    const q = Post.collection()
      .query(qb => {
        qb
          .join('posts_schools', 'posts.id', 'posts_schools.post_id')
          .join('schools', 'posts_schools.school_id', 'schools.id')
          .where('schools.url_name', ctx.params.school)
          .andWhere('posts_schools.visible', true)
          .orderBy('posts.created_at', 'desc');
      });

    let posts = await q.fetch({ withRelated: POST_RELATIONS });
    const post_comments_count = await this.countComments(posts);

    posts = posts.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({ id: row.id, name: row.attributes.name, url_name: row.attributes.url_name }));
      post.attributes.comments = post_comments_count[post.get('id')];
      return post;
    });

    posts = await hidePostsData(posts, ctx, this.bookshelf.knex);
    ctx.body = posts;
  };

  geotagPosts = async (ctx) => {
    const Post = this.bookshelf.model('Post');
    const Geotag = this.bookshelf.model('Geotag');

    try {
      const geotag = await Geotag
        .forge()
        .where({ url_name: ctx.params.url_name })
        .fetch({ require: true });

      let posts = await Post
        .collection()
        .query(qb => {
          qb
            .join('geotags_posts', 'posts.id', 'geotags_posts.post_id')
            .join('geotags', 'geotags_posts.geotag_id', 'geotags.id')
            .orderBy('posts.created_at', 'desc')
            .distinct();

          switch (geotag.attributes.type) {
            case 'Planet':
             // There are no planets besides Earth yet.
              break;
            case 'Continent':
              qb.where('geotags.continent_code', geotag.attributes.continent_code);
              break;
            case 'Country':
              qb.where('geotags.geonames_country_id', geotag.attributes.geonames_country_id);
              break;
            case 'AdminDivision1':
              qb.where('geotags.geonames_admin1_id', geotag.attributes.geonames_admin1_id);
              break;
            case 'City':
              qb.where('geotags.id', geotag.id);
              break;
          }
        })
        .fetch({ withRelated: POST_RELATIONS });

      const post_comments_count = await this.countComments(posts);

      posts = posts.map(post => {
        post.relations.schools = post.relations.schools.map(row => ({ id: row.id, name: row.attributes.name, url_name: row.attributes.url_name }));
        post.attributes.comments = post_comments_count[post.get('id')];
        return post;
      });

      posts = await hidePostsData(posts, ctx, this.bookshelf.knex);
      ctx.body = posts;
    } catch (e) {
      ctx.status = 404;
      return;
    }
  };

  userTags = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }
    const Hashtag = this.bookshelf.model('Hashtag');
    const hashtags = await Hashtag
      .collection()
      .query(qb => {
        qb
          .join('hashtags_posts', 'hashtags_posts.hashtag_id', 'hashtags.id')
          .join('posts', 'hashtags_posts.post_id', 'posts.id')
          .where('posts.user_id', ctx.session.user)
          .distinct();
      })
      .fetch();

    const School = this.bookshelf.model('School');
    const schools = await School
      .collection()
      .query(qb => {
        qb
          .join('posts_schools', 'posts_schools.school_id', 'schools.id')
          .join('posts', 'posts_schools.post_id', 'posts.id')
          .where('posts.user_id', ctx.session.user)
          .distinct();
      })
      .fetch();

    const Geotag = this.bookshelf.model('Geotag');
    const geotags = await Geotag
      .collection()
      .query(qb => {
        qb
          .join('geotags_posts', 'geotags_posts.geotag_id', 'geotags.id')
          .join('posts', 'geotags_posts.post_id', 'posts.id')
          .where('posts.user_id', ctx.session.user)
          .distinct();
      })
      .fetch();

    ctx.body = { hashtags, schools, geotags };
  };

  getPost = async (ctx) => {
    const Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({ id: ctx.params.id }).fetch({ require: true, withRelated: POST_RELATIONS });

      post.relations.schools = post.relations.schools.map(row => ({ id: row.id, name: row.attributes.name, url_name: row.attributes.url_name }));
      post.attributes.comments = post.relations.post_comments.length;

      post = await hidePostsData(post, ctx, this.bookshelf.knex);
      ctx.body = post;
    } catch (e) {
      ctx.status = 404;
      return;
    }
  };

  currentUserLikedPosts = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    try {
      const posts = await this.getLikedPosts(ctx.session.user);
      ctx.body = posts;
    } catch (e) {
      ctx.status = 500;
      ctx.body = e.message;
    }
  };

  userLikedPosts = async (ctx) =>  {
    try {
      const user = await this.bookshelf.knex
        .first('id')
        .from('users')
        .where('users.username', '=', ctx.params.user);

      if (user) {
        const posts = await this.getLikedPosts(user.id);
        ctx.body = posts;
      } else {
        ctx.app.logger.warn(`Someone tried read liked posts for '${ctx.params.user}', but there's no such user`);
        ctx.body = [];
      }
    } catch (e) {
      ctx.status = 500;
      ctx.body = e.message;
    }
  };

  getLikedPosts = async (userId) => {
    const Post = this.bookshelf.model('Post');

    const likes = await this.bookshelf.knex
      .select('post_id')
      .from('likes')
      .where({ user_id: userId })
      .map(row => row.post_id);

    const q = Post.forge()
      .query(qb => {
        qb
          .select()
          .from('posts')
          .whereIn('id', likes)
          .union(function () {
            this
              .select()
              .from('posts')
              .whereIn('type', ['hashtag_like', 'school_like', 'geotag_like'])
              .andWhere('user_id', userId);
          })
          .orderBy('updated_at', 'desc');
      });

    let posts = await q.fetchAll({ require: false, withRelated: POST_RELATIONS });
    const post_comments_count = await this.countComments(posts);
    posts = posts.map(post => {
      post.attributes.comments = post_comments_count[post.get('id')];
      return post;
    });

    posts = await hidePostsData(posts, userId, this.bookshelf.knex);

    return posts;
  };

  currentUserFavouredPosts = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    try {
      const posts = await this.getFavouredPosts(ctx.session.user);
      ctx.body = posts;
    } catch (e) {
      ctx.status = 500;
      ctx.body = e.message;
    }
  };

  userFavouredPosts = async (ctx) => {
    try {
      const user = await this.bookshelf.knex
        .first('id')
        .from('users')
        .where('users.username', '=', ctx.params.user);

      if (user) {
        const posts = await this.getFavouredPosts(user.id);
        ctx.body = posts;
      } else {
        ctx.app.logger.warn(`Someone tried read favoured posts for '${ctx.params.user}', but there's no such user`);
        ctx.body = [];
      }
    } catch (e) {
      ctx.status = 500;
      ctx.body = e.message;
    }
  };

  getFavouredPosts = async (userId) => {
    const Post = this.bookshelf.model('Post');

    const favourites = await this.bookshelf.knex
      .select('post_id')
      .from('favourites')
      .where({ user_id: userId })
      .map(row => row.post_id);

    const q = Post.forge()
      .query(qb => {
        qb
          .whereIn('id', favourites)
          .orderBy('posts.updated_at', 'desc');
      });

    let posts = await q.fetchAll({ require: false, withRelated: POST_RELATIONS });
    const post_comments_count = await this.countComments(posts);
    posts = posts.map(post => {
      post.attributes.comments = post_comments_count[post.get('id')];
      return post;
    });

    posts = await hidePostsData(posts, userId, this.bookshelf.knex);
    return posts;
  };

  checkSchoolExists = async (ctx) => {
    const School = this.bookshelf.model('School');

    try {
      await School.where('name', ctx.params.name).fetch({ require: true });

      ctx.status = 200;
    } catch (e) {
      ctx.status = 404;
    }
  };

  getSchool = async (ctx) => {
    const School = this.bookshelf.model('School');

    try {
      const school = await School
        .where({ url_name: ctx.params.url_name })
        .fetch({ require: true, withRelated: 'images' });

      ctx.body = school.toJSON();
    } catch (e) {
      ctx.status = 404;
      return;
    }
  };

  getSchools = async (ctx) => {
    const School = this.bookshelf.model('School');

    try {
      const schools = await School.collection().query(qb => {
        if ('limit' in ctx.query) {
          qb.limit(ctx.query.limit);
        }

        qb.offset(ctx.query.offset);
        this.applySortQuery(qb, ctx.query, 'name');

        if (ctx.query.havePosts) {
          qb.where('post_count', '>', 0);
        }

        if (ctx.query.startWith) {
          qb.where('name', 'ILIKE', `${ctx.query.startWith}%`);
        }
      }).fetch({ withRelated: 'images' });

      ctx.body = schools.toJSON();
    } catch (e) {
      ctx.status = 404;
      return;
    }
  };

  getSchoolsAlphabet = async (ctx) => {
    const knex = this.bookshelf.knex;

    const alphabet = await knex('schools')
      .select(knex.raw('DISTINCT(upper(substring(name FROM 1 FOR 1))) as letter'))
      .where('post_count', '>', 0)
      .orderBy('letter');

    ctx.body = alphabet
      .map(row => row.letter)
      .filter(l => l && l.length);
  }

  getCountries = async (ctx) => {
    const Geotag = this.bookshelf.model('Geotag');

    try {
      const countries = await Geotag.where({ type: 'Country' }).fetchAll();
      ctx.body = countries.toJSON();
    } catch (e) {
      ctx.status = 404;
      return;
    }
  };

  getCountry = async (ctx) => {
    const Country = this.bookshelf.model('Country');

    try {
      const country = await Country.where({ iso_alpha2: ctx.params.code }).fetch();
      ctx.body = country.toJSON();
    } catch (e) {
      ctx.status = 404;
      return;
    }
  };

  getCity = async (ctx) => {
    const City = this.bookshelf.model('City');

    try {
      const city = await City.where({ id: ctx.params.id }).fetch();
      ctx.body = city.toJSON();
    } catch (e) {
      ctx.status = 404;
      return;
    }
  };

  updateGeotag = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!('id' in ctx.params)) {
      ctx.status = 400;
      ctx.body = { error: '"id" parameter is not given' };
      return;
    }

    const checkit = new Checkit(GeotagValidators.more);

    try {
      await checkit.run(ctx.request.body.more);
    } catch (e) {
      ctx.status = 400;
      ctx.body = { error: e.toJSON() };
      return;
    }

    try {
      const Geotag = this.bookshelf.model('Geotag');
      const geotag = await Geotag.where({ id: ctx.params.id }).fetch({ require: true });

      let properties = {};
      for (const fieldName in GeotagValidators.more) {
        if (fieldName in ctx.request.body.more) {
          properties[fieldName] = ctx.request.body.more[fieldName];
        }
      }

      properties.last_editor = ctx.session.user;
      properties = _.extend(geotag.get('more'), properties);

      geotag.set('more', properties);
      await geotag.save(null, { method: 'update' });

      ctx.body = geotag;
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: 'Update failed' };
      return;
    }
  };

  updateHashtag = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!('id' in ctx.params)) {
      ctx.status = 400;
      ctx.body = { error: '"id" parameter is not given' };
      return;
    }

    const checkit = new Checkit(HashtagValidators.more);

    try {
      await checkit.run(ctx.request.body.more);
    } catch (e) {
      ctx.status = 400;
      ctx.body = { error: e.toJSON() };
      return;
    }

    try {
      const Hashtag = this.bookshelf.model('Hashtag');
      const hashtag = await Hashtag.where({ id: ctx.params.id }).fetch({ require: true });

      let properties = {};
      for (const fieldName in HashtagValidators.more) {
        if (fieldName in ctx.request.body.more) {
          properties[fieldName] = ctx.request.body.more[fieldName];
        }
      }

      properties.last_editor = ctx.session.user;
      properties = _.extend(hashtag.get('more'), properties);

      hashtag.set('more', properties);
      await hashtag.save(null, { method: 'update' });

      ctx.body = hashtag;
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: 'Update failed' };
      return;
    }
  };

  createSchool = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!('name' in ctx.request.body)) {
      ctx.status = 400;
      ctx.body = { error: '"name" property is not given' };
      return;
    }

    const name = removeWhitespace(ctx.request.body.name);

    if (!name) {
      ctx.status = 400;
      ctx.body = { error: '"name" mustn\'t be an empty string' };
      return;
    }

    const School = this.bookshelf.model('School');

    try {
      await School.where({ name }).fetch({ require: true });

      ctx.status = 409;
      ctx.body = { error: 'School with such name is already registered' };
      return;
    } catch (e) {
      // go next
    }

    try {
      const allowedAttributes = [
        'name', 'description',
        'lat', 'lon',
        'is_open', 'principal_name', 'principal_surname',
        'foundation_date',
        'number_of_students', 'org_membership',
        'teaching_languages', 'required_languages',
        'country_id', 'postal_code', 'city', 'address1', 'address2', 'house', 'phone',
        'website', 'facebook', 'twitter', 'wikipedia'
      ];

      const processData = (data) => {
        if ('is_open' in data) {
          if (data.is_open !== true && data.is_open !== false && data.is_open !== null) {
            throw new Error("'is_open' has to be boolean or null");
          }
        }

        if ('number_of_students' in data) {
          if (!_.isPlainObject(data.number_of_students)) {
            throw new Error("'number_of_students' should be an object");
          }
        }

        if ('org_membership' in data) {
          if (!_.isPlainObject(data.org_membership)) {
            throw new Error("'org_membership' should be an object");
          }
        }

        if ('teaching_languages' in data) {
          if (!_.isArray(data.teaching_languages)) {
            throw new Error("'teaching_languages' should be an array");
          }
          data.teaching_languages = JSON.stringify(data.teaching_languages);
        }

        if ('required_languages' in data) {
          if (!_.isArray(data.required_languages)) {
            throw new Error("'required_languages' should be an array");
          }
          data.required_languages = JSON.stringify(data.required_languages);
        }

        for (const key in data) {
          if (data[key] === '') {
            data[key] = null;
          }
        }

        return data;
      };

      const attributesWithValues = processData({
        ..._.pick(ctx.request.body, allowedAttributes),
        name
      });

      const properties = {};
      if (ctx.request.body.more) {
        for (const fieldName in SchoolValidators.more) {
          if (fieldName in ctx.request.body.more) {
            properties[fieldName] = ctx.request.body.more[fieldName];
          }
        }
      }

      properties.last_editor = ctx.session.user;
      attributesWithValues.more = properties;

      const school = new School({
        id: uuid.v4()
      });

      school.set(attributesWithValues);
      school.set('url_name', slug(attributesWithValues.name));

      await school.save(null, { method: 'insert' });

      // 'school' variable doesn't contain default school properties (e.g. 'post_count')
      const newSchool = await School.where({ name }).fetch({ require: true });

      ctx.body = newSchool.toJSON();
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
    }
  }

  updateSchool = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!('id' in ctx.params)) {
      ctx.status = 400;
      ctx.body = { error: '"id" parameter is not given' };
      return;
    }

    const School = this.bookshelf.model('School');

    try {
      const school = await School.where({ id: ctx.params.id }).fetch({ require: true, withRelated: 'images' });

      const allowedAttributes = [
        'name', 'description',
        'lat', 'lon',
        'is_open', 'principal_name', 'principal_surname',
        'foundation_date',
        'number_of_students', 'org_membership',
        'teaching_languages', 'required_languages',
        'country_id', 'postal_code', 'city', 'address1', 'address2', 'house', 'phone',
        'website', 'facebook', 'twitter', 'wikipedia'
      ];
      const processData = (data) => {
        if ('is_open' in data) {
          if (data.is_open !== true && data.is_open !== false && data.is_open !== null) {
            throw new Error("'is_open' has to be boolean or null");
          }
        }

        if ('number_of_students' in data) {
          if (!_.isPlainObject(data.number_of_students)) {
            throw new Error("'number_of_students' should be an object");
          }
        }

        if ('org_membership' in data) {
          if (!_.isPlainObject(data.org_membership)) {
            throw new Error("'org_membership' should be an object");
          }
        }

        if ('teaching_languages' in data) {
          if (!_.isArray(data.teaching_languages)) {
            throw new Error("'teaching_languages' should be an array");
          }
          data.teaching_languages = JSON.stringify(data.teaching_languages);
        }

        if ('required_languages' in data) {
          if (!_.isArray(data.required_languages)) {
            throw new Error("'required_languages' should be an array");
          }
          data.required_languages = JSON.stringify(data.required_languages);
        }

        for (const key in data) {
          if (data[key] === '') {
            data[key] = null;
          }
        }

        return data;
      };

      const attributesWithValues = processData(_.pick(ctx.request.body, allowedAttributes));

      const properties = {};
      for (const fieldName in SchoolValidators.more) {
        if (fieldName in ctx.request.body.more) {
          properties[fieldName] = ctx.request.body.more[fieldName];
        }
      }

      properties.last_editor = ctx.session.user;
      attributesWithValues.more = _.extend(school.get('more'), properties);

      school.set(attributesWithValues);

      if (ctx.request.body.images) {
        if (!_.isArray(ctx.request.body.images)) {
          ctx.status = 400;
          ctx.body = { error: `"images" parameter is expected to be an array` };
          return;
        }

        const images = _.uniq(ctx.request.body.images);

        if (_.isArray(images)) {
          school.updateImages(images);
        }
      }

      let languages = school.get('teaching_languages');
      if (_.isArray(languages)) {
        school.set('teaching_languages', JSON.stringify(languages));
      }
      languages = school.get('required_languages');
      if (_.isArray(languages)) {
        school.set('required_languages', JSON.stringify(languages));
      }

      await school.save();

      ctx.body = school;
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
    }
  };

  likePost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const result = { success: false };

    const User = this.bookshelf.model('User');
    const Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({ id: ctx.params.id }).fetch({ require: true });
      const user = await User.where({ id: ctx.session.user }).fetch({ require: true, withRelated: ['liked_posts'] });

      if (post.get('user_id') === user.id) {
        ctx.status = 403;
        ctx.body = { error: "You can't like your own post" };
        return;
      }

      await user.liked_posts().attach(post);

      post.attributes.updated_at = new Date().toJSON();
      await post.save(null, { method: 'update' });

      post = await Post.where({ id: ctx.params.id }).fetch({ require: true, withRelated: ['likers'] });
      post = await hidePostsData(post, ctx, this.bookshelf.knex);

      const likes = await this.bookshelf.knex
        .select('post_id')
        .from('likes')
        .where({ user_id: ctx.session.user });

      result.success = true;
      result.likes = likes.map(row => row.post_id);
      result.likers = post.likers;
    } catch (ex) {
      ctx.status = 500;
      result.error = ex.message;
    }

    ctx.body = result;
  };

  unlikePost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const result = { success: false };

    const User = this.bookshelf.model('User');
    const Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({ id: ctx.params.id }).fetch({ require: true });
      const user = await User.where({ id: ctx.session.user }).fetch({ require: true, withRelated: ['liked_posts'] });

      await user.liked_posts().detach(post);

      post.attributes.updated_at = new Date().toJSON();
      await post.save(null, { method: 'update' });

      post = await Post.where({ id: ctx.params.id }).fetch({ require: true, withRelated: ['likers'] });
      post = await hidePostsData(post, ctx, this.bookshelf.knex);

      const likes = await this.bookshelf.knex
        .select('post_id')
        .from('likes')
        .where({ user_id: ctx.session.user });

      result.success = true;
      result.likes = likes.map(row => row.post_id);
      result.likers = post.likers;
    } catch (ex) {
      ctx.status = 500;
      result.error = ex.message;
    }

    ctx.body = result;
  };

  favPost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const result = { success: false };

    const User = this.bookshelf.model('User');
    const Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({ id: ctx.params.id }).fetch({ require: true });
      const user = await User.where({ id: ctx.session.user }).fetch({ require: true, withRelated: ['favourited_posts'] });

      if (post.get('user_id') === user.id) {
        ctx.status = 403;
        ctx.body = { error: "You can't add your own post to favorites" };
        return;
      }

      await user.favourited_posts().attach(post);

      post = await Post.where({ id: ctx.params.id }).fetch({ require: true, withRelated: ['favourers'] });
      post = await hidePostsData(post, ctx, this.bookshelf.knex);

      const favs = await this.bookshelf.knex
        .select('post_id')
        .from('favourites')
        .where({ user_id: ctx.session.user });

      result.success = true;
      result.favourites = favs.map(row => row.post_id);
      result.favourers = post.favourers;
    } catch (ex) {
      ctx.status = 500;
      result.error = ex.message;
    }

    ctx.body = result;
  };

  unfavPost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const result = { success: false };

    const User = this.bookshelf.model('User');
    const Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({ id: ctx.params.id }).fetch({ require: true });
      const user = await User.where({ id: ctx.session.user }).fetch({ require: true, withRelated: ['favourited_posts'] });

      await user.favourited_posts().detach(post);

      post = await Post.where({ id: ctx.params.id }).fetch({ require: true, withRelated: ['favourers'] });
      post = await hidePostsData(post, ctx, this.bookshelf.knex);

      const favs = await this.bookshelf.knex
        .select('post_id')
        .from('favourites')
        .where({ user_id: ctx.session.user });

      result.success = true;
      result.favourites = favs.map(row => row.post_id);
      result.favourers = post.favourers;
    } catch (ex) {
      ctx.status = 500;
      result.error = ex.message;
    }

    ctx.body = result;
  };

  subscriptions = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const uid = ctx.session.user;
    const Post = this.bookshelf.model('Post');

    const offset = ('offset' in ctx.query) ? parseInt(ctx.query.offset, 10) : 0;

    const q = Post.forge()
      .query(qb => {
        qb
          .leftJoin('followers', 'followers.following_user_id', 'posts.user_id')
          .whereRaw('(followers.user_id = ? OR posts.user_id = ?)', [uid, uid])  // followed posts
          .whereRaw('(posts.fully_published_at IS NOT NULL OR posts.user_id = ?)', [uid]) // only major and own posts
          .orderBy('posts.updated_at', 'desc')
          .groupBy('posts.id')
          .limit(5)
          .offset(offset);
      });

    let posts = await q.fetchAll({ require: false, withRelated: POST_RELATIONS });
    const post_comments_count = await this.countComments(posts);
    posts = posts.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({ id: row.id, name: row.attributes.name, url_name: row.attributes.url_name }));
      post.attributes.comments = post_comments_count[post.get('id')];
      return post;
    });

    ctx.body = posts;
  };

  hashtagSubscriptions = async (ctx) => {
    // TODO: Replace with `auth` middleware in routes.js after https://github.com/Lokiedu/libertysoil-site/pull/868 is merged.
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const Post = this.bookshelf.model('Post');

    // TODO: replace ctx.session.user with ctx.state.user after #686
    const hashtags = await this.bookshelf.knex('followed_hashtags_users')
      .where('user_id', ctx.session.user);
    const hashtagIds = hashtags.map(t => t.hashtag_id);

    const q = Post.collection()
      .query(qb => {
        qb
          .join('hashtags_posts', 'hashtags_posts.post_id', 'posts.id')
          .whereNot('user_id', ctx.session.user)
          .whereIn('hashtags_posts.hashtag_id', hashtagIds)
          .orderBy('posts.updated_at', 'desc')
          .groupBy('posts.id');

        this.applyLimitQuery(qb, ctx.query, 5);
        this.applyOffsetQuery(qb, ctx.query);
        this.applySortQuery(qb, ctx.query, '-updated_at');
      });

    let posts = await q.fetch({ withRelated: POST_RELATIONS });
    posts = await this.cleanUpPosts(posts);

    ctx.body = posts;
  };

  schoolSubscriptions = async (ctx) => {
    // TODO: Replace with `auth` middleware in routes.js after https://github.com/Lokiedu/libertysoil-site/pull/868 is merged.
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const Post = this.bookshelf.model('Post');

    // TODO: replace ctx.session.user with ctx.state.user after #686
    const schools = await this.bookshelf.knex('followed_schools_users')
      .where('user_id', ctx.session.user);
    const schoolIds = schools.map(t => t.school_id);

    const q = Post.collection()
      .query(qb => {
        qb
          .join('posts_schools', 'posts_schools.post_id', 'posts.id')
          .whereNot('user_id', ctx.session.user)
          .whereIn('posts_schools.school_id', schoolIds)
          .orderBy('posts.updated_at', 'desc')
          .groupBy('posts.id');

        this.applyLimitQuery(qb, ctx.query, 5);
        this.applyOffsetQuery(qb, ctx.query);
        this.applySortQuery(qb, ctx.query, '-updated_at');
      });

    let posts = await q.fetch({ withRelated: POST_RELATIONS });
    posts = await this.cleanUpPosts(posts);

    ctx.body = posts;
  };

  geotagSubscriptions = async (ctx) => {
    // TODO: Replace with `auth` middleware in routes.js after https://github.com/Lokiedu/libertysoil-site/pull/868 is merged.
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const Post = this.bookshelf.model('Post');

    // TODO: replace ctx.session.user with ctx.state.user after #686
    const geotags = await this.bookshelf.knex('followed_geotags_users')
      .where('user_id', ctx.session.user);
    const geotagIds = geotags.map(t => t.geotag_id);

    // When it gets to slow we might try to add parent ids to geotags_posts instead of joining geotags.
    const q = Post.collection()
      .query(qb => {
        qb
          .join('geotags_posts', 'geotags_posts.post_id', 'posts.id')
          .join('geotags', 'geotags.id', 'geotags_posts.geotag_id')
          .whereNot('user_id', ctx.session.user)
          .where((qb) => {
            qb
              .whereIn('geotags.id', geotagIds)
              .orWhereIn('geotags.continent_id', geotagIds)
              .orWhereIn('geotags.country_id', geotagIds)
              .orWhereIn('geotags.admin1_id', geotagIds);
          })
          .orderBy('posts.updated_at', 'desc')
          .groupBy('posts.id');

        this.applyLimitQuery(qb, ctx.query, 5);
        this.applyOffsetQuery(qb, ctx.query);
        this.applySortQuery(qb, ctx.query, '-updated_at');
      });

    let posts = await q.fetch({ withRelated: POST_RELATIONS });
    posts = await this.cleanUpPosts(posts);

    ctx.body = posts;
  };

  checkUserExists = async (ctx) => {
    const User = this.bookshelf.model('User');

    try {
      await User
        .forge()
        .where('username', ctx.params.username)
        .fetch({ require: true });

      ctx.status = 200;
    } catch (e) {
      ctx.status = 404;
    }
  };

  checkEmailTaken = async (ctx) => {
    const User = this.bookshelf.model('User');

    try {
      await User
        .forge()
        .where('email', ctx.params.email)
        .fetch({ require: true });

      ctx.status = 200;
    } catch (e) {
      ctx.status = 404;
    }
  };

  getAvailableUsername = async (ctx) => {
    const User = this.bookshelf.model('User');

    async function checkUserExists(username) {
      const user = await User
        .forge()
        .where('username', username)
        .fetch();

      return !!user;
    }

    try {
      let username = ctx.params.username;

      for (let i = 1; await checkUserExists(username); ++i) {
        username = `${ctx.params.username}${i}`;
      }

      ctx.body = { username };
    } catch (e) {
      ctx.status = 404;
      ctx.body = { error: e.message };
    }
  };

  registerUser = async (ctx) => {
    const optionalFields = ['firstName', 'lastName'];

    const checkit = new Checkit(UserValidators.registration);
    try {
      await checkit.run(ctx.request.body);
    } catch (e) {
      ctx.status = 400;
      ctx.body = { error: e.toJSON() };
      return;
    }

    const User = this.bookshelf.model('User');
    const username = ctx.request.body.username.toLowerCase();

    {
      const check = await User.where({ username }).fetch({ require: false });
      if (check) {
        ctx.status = 409;
        ctx.body = { error: 'signup.errors.username_taken' };
        return;
      }
    }

    {
      const check = await User.where({ email: ctx.request.body.email }).fetch({ require: false });
      if (check) {
        ctx.status = 409;
        ctx.body = { error: 'signup.errors.email_taken' };
        return;
      }
    }

    const moreData = {};
    for (const fieldName of optionalFields) {
      if (fieldName in ctx.request.body) {
        moreData[fieldName] = ctx.request.body[fieldName];
      }
    }

    moreData.first_login = true;

    let user;

    try {
      user = await User.create(username, ctx.request.body.password, ctx.request.body.email, moreData);
    } catch (e) {
      if (e.code == 23505) {
        ctx.status = 401;
        ctx.body = { error: 'signup.errors.username_taken' };
        return;
      }

      throw e;
    }

    this.queue.createJob('register-user-email', {
      username: user.get('username'),
      email: user.get('email'),
      hash: user.get('email_check_hash')
    });

    ctx.body = { success: true, user };
  };

  login = async (ctx) => {
    if (!ctx.session) {
      ctx.app.emit('error', 'Session engine is not available, have you started redis service?');

      ctx.status = 500;
      ctx.body = { error: 'api.errors.internal' };
      return;
    }

    const requiredFields = ['username', 'password'];

    for (const fieldName of requiredFields) {
      if (!(fieldName in ctx.request.body)) {
        ctx.status = 400;
        ctx.body = { error: 'api.errors.bad_request' };
        return;
      }
    }

    const User = this.bookshelf.model('User');
    const username = ctx.request.body.username.toLowerCase();

    let user;

    try {
      user = await new User({ username }).fetch({ require: true });
    } catch (e) {
      ctx.app.logger.warn(`Someone tried to log in as '${username}', but there's no such user`);
      ctx.status = 401;
      ctx.body = { success: false };
      return;
    }

    const passwordIsValid = await bcryptAsync.compareAsync(ctx.request.body.password, user.get('hashed_password'));

    if (!passwordIsValid) {
      ctx.app.logger.warn(`Someone tried to log in as '${username}', but used wrong pasword`);
      ctx.status = 401;
      ctx.body = { success: false };
      return;
    }

    if (user.get('email_check_hash')) {
      ctx.app.logger.warn(`user '${username}' has not validated email`);
      ctx.status = 401;
      ctx.body = { success: false, error: 'login.errors.email_unchecked' };
      return;
    }

    ctx.session.user = user.id;
    user = await User
      .where({ id: ctx.session.user })
      .fetch({
        require: true,
        withRelated: USER_RELATIONS
      });

    ctx.body = { success: true, user };
  };

  verifyEmail = async (ctx) => {
    const User = this.bookshelf.model('User');

    let user;

    try {
      user = await new User({ email_check_hash: ctx.params.hash }).fetch({ require: true });
    } catch (e) {
      ctx.app.logger.warn(`Someone tried to verify email, but used invalid hash`);
      ctx.status = 401;
      ctx.body = { success: false };
      return;
    }

    user.set('email_check_hash', '');
    await user.save(null, { method: 'update' });

    this.queue.createJob('verify-email', {
      username: user.get('username'),
      email: user.get('email')
    });

    ctx.redirect('/');
  };

  /**
   * Looks users record by submitted email, saves user random SHA1 hash.
   * If user is authorized. Show error message.
   *
   * If no user found send status 401.
   *
   * When user saved successfully, send message (publich event?) to user with
   * Reset password end-point url like: http://libertysoil/resetpasswordfrom?code={generatedcode}
   */
  resetPassword = async (ctx) => {
    if (ctx.session && ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'Please use profile change password feature.' };
      return;
    }

    for (const fieldName of ['email']) {
      if (!(fieldName in ctx.request.body)) {
        ctx.status = 400;
        ctx.body = { error: 'Bad Request' };
        return;
      }
    }

    const User = this.bookshelf.model('User');

    let user;

    try {
      user = await new User({ email: ctx.request.body.email }).fetch({ require: true });
    } catch (e) {
      // we do not show any error if we do not have user.
      // To prevent disclosure information about registered emails.
      ctx.status = 200;
      ctx.body = { success: true };
      return;
    }

    const random = Math.random().toString();
    const sha1 = crypto.createHash('sha1').update(user.email + random).digest('hex');

    if (!user.get('reset_password_hash')) {
      user.set('reset_password_hash', sha1);
      await user.save(null, { method: 'update' });
    }

    this.queue.createJob('reset-password-email', {
      username: user.get('username'),
      email: ctx.request.body.email,
      hash: user.get('reset_password_hash')
    });

    ctx.status = 200;
    ctx.body = { success: true };
  };

  /**
   * New password form action.
   * Validates new password form with password/password repeat values.
   * Saves new password to User model.
   */
  newPassword = async (ctx) => {
    if (ctx.session && ctx.session.user) {
      ctx.redirect('/');
      return;
    }

    const User = this.bookshelf.model('User');
    const PasswordChange = this.bookshelf.model('PasswordChange');

    let user;

    try {
      user = await new User({ reset_password_hash: ctx.params.hash }).fetch({ require: true });
    } catch (e) {
      ctx.app.logger.warn(`Someone tried to reset password using unknown reset-hash`);
      ctx.status = 401;
      ctx.body = { success: false, error: 'Unauthorized' };
      return;
    }

    if (!('password' in ctx.request.body) || !('password_repeat' in ctx.request.body)) {
      ctx.status = 400;
      ctx.body = { error: '"password" or "password_repeat" parameter is not provided' };
      return;
    }

    if (ctx.request.body.password !== ctx.request.body.password_repeat) {
      ctx.status = 400;
      ctx.body = { error: '"password" and "password_repeat" do not exact match.' };
      return;
    }

    const hashedPassword = await bcryptAsync.hashAsync(ctx.request.body.password, 10);
    const prevHashedPassword = user.get('hashed_password');

    user.set('hashed_password', hashedPassword);
    user.set('reset_password_hash', '');

    await user.save(null, { method: 'update' });

    await new PasswordChange({
      user_id: user.id,
      prev_hashed_password: prevHashedPassword,
      ip: ctx.ip,
      event_type: 'reset'
    }).save();

    ctx.body = { success: true };
  };

  logout = async (ctx) => {
    if (ctx.session && ctx.session.user) {
      ctx.session = null;
    }
    ctx.redirect('/');
  };

  userSuggestions = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const User = this.bookshelf.model('User');

    const user = await User.where({ id: ctx.session.user }).fetch({ require: true, withRelated: ['ignored_users', 'following'] });

    const ignoredIds = user.related('ignored_users').pluck('id');
    const followingIds = user.related('following').pluck('id');

    const usersToIgnore = _.uniq(_.concat(ignoredIds, followingIds));

    const suggestions = await User
      .collection()
      .query(qb => {
        qb
          .select('active_users.*')
          .from(function () {
            this.select('users.*')
              .count('posts.id as post_count')
              .from('users')
              .where('users.id', '!=', ctx.session.user)
              .leftJoin('posts', 'users.id', 'posts.user_id')
              .groupBy('users.id')
              .as('active_users');
          })
          .whereNotIn('active_users.id', usersToIgnore)
          .orderBy('post_count', 'desc')
          .limit(6);
      })
      .fetch({ withRelated: ['following', 'followers', 'liked_posts', 'favourited_posts'] });

    ctx.body = suggestions;
  };

  initialSuggestions = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const User = this.bookshelf.model('User');

    const q = User.forge()
      .query(qb => {
        qb
          .select('users.*')
          .count('posts.id as post_count')
          .from('users')
          .where('users.id', '!=', ctx.session.user)
          .leftJoin('posts', 'users.id', 'posts.user_id')
          .groupBy('users.id')
          .orderBy('post_count', 'desc')
          .limit(20);
      });

    const suggestions = await q.fetchAll({ withRelated: ['following', 'followers', 'liked_posts', 'favourited_posts'] });

    ctx.body = suggestions;
  };

  createPost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!('type' in ctx.request.body)) {
      ctx.status = 400;
      ctx.body = { error: '"type" parameter is not given' };
      return;
    }

    const typeRequirements = {
      short_text: ['text'],
      long_text: ['title', 'text']
    };

    if (!(ctx.request.body.type in typeRequirements)) {
      ctx.status = 400;
      ctx.body = { error: `"${ctx.request.body.type}" type is not supported` };
      return;
    }

    const thisTypeRequirements = typeRequirements[ctx.request.body.type];

    for (const varName of thisTypeRequirements) {
      if (!(varName in ctx.request.body)) {
        ctx.status = 400;
        ctx.body = { error: `"${varName}" parameter is not given` };
        return;
      }
    }

    let hashtags;

    if ('hashtags' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.hashtags)) {
        ctx.status = 400;
        ctx.body = { error: `"hashtags" parameter is expected to be an array` };
        return;
      }

      if (ctx.request.body.hashtags.filter(tag => (countBreaks(tag) < 3)).length > 0) {
        ctx.status = 400;
        ctx.body = { error: `each of tags should be at least 3 characters wide` };
        return;
      }

      hashtags = _.uniq(ctx.request.body.hashtags);
    }

    let schools;

    if ('schools' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.schools)) {
        ctx.status = 400;
        ctx.body = { error: `"schools" parameter is expected to be an array` };
        return;
      }

      schools = _.uniq(ctx.request.body.schools);
    }

    let geotags;

    if ('geotags' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.geotags)) {
        ctx.status = 400;
        ctx.body = { error: `"geotags" parameter is expected to be an array` };
        return;
      }

      geotags = _.uniq(ctx.request.body.geotags);
    }

    const Post = this.bookshelf.model('Post');

    const obj = new Post({
      id: uuid.v4(),
      type: ctx.request.body.type,
      user_id: ctx.session.user
    });

    const more = {};

    if (ctx.request.body.type === 'short_text') {
      obj.set('text', ctx.request.body.text);
    } else if (ctx.request.body.type === 'long_text') {
      obj.set('text', ctx.request.body.text);
      more.title = ctx.request.body.title;
    }

    if (!ctx.request.body.minor_update) {
      // Show post in the news feed.
      obj.set('fully_published_at', new Date().toJSON());
    }

    if (!Post.typesWithoutPages.includes(obj.get('type'))) {
      const author = await obj.related('user').fetch();
      more.pageTitle = await Post.titleFromText(ctx.request.body.text, author.get('fullName'));

      const urlName = `${slug(more.pageTitle)}-${obj.id}`;
      obj.set('url_name', urlName);
    }

    obj.set('more', more);

    try {
      await obj.save(null, { method: 'insert' });

      if (_.isArray(hashtags)) {
        await obj.attachHashtags(hashtags);
      }

      if (_.isArray(schools)) {
        await obj.attachSchools(schools);
      }

      if (_.isArray(geotags)) {
        await obj.attachGeotags(geotags);
      }

      // Add the author to the list of subscribers by default.
      obj.subscribers().attach(ctx.session.user);

      await obj.fetch({ require: true, withRelated: POST_RELATIONS });
      obj.relations.schools = obj.relations.schools.map(row => ({ id: row.id, name: row.attributes.name, url_name: row.attributes.url_name }));

      ctx.body = obj.toJSON();
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
      return;
    }
  };

  updatePost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!('id' in ctx.params)) {
      ctx.status = 400;
      ctx.body = { error: '"id" parameter is not given' };
      return;
    }

    const Post = this.bookshelf.model('Post');

    let post_object;

    try {
      post_object = await Post.where({ id: ctx.params.id, user_id: ctx.session.user }).fetch({ require: true, withRelated: ['hashtags'] });
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
      return;
    }

    const type = post_object.get('type');

    let hashtags;

    if ('hashtags' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.hashtags)) {
        ctx.status = 400;
        ctx.body = { error: `"hashtags" parameter is expected to be an array` };
        return;
      }

      if (ctx.request.body.hashtags.filter(tag => (countBreaks(tag) < 3)).length > 0) {
        ctx.status = 400;
        ctx.body = { error: `each of tags should be at least 3 characters wide` };
        return;
      }

      hashtags = _.uniq(ctx.request.body.hashtags);
    }

    let schools;

    if ('schools' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.schools)) {
        ctx.status = 400;
        ctx.body = { error: `"schools" parameter is expected to be an array` };
        return;
      }

      schools = _.uniq(ctx.request.body.schools);
    }

    let geotags;

    if ('geotags' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.geotags)) {
        ctx.status = 400;
        ctx.body = { error: `"geotags" parameter is expected to be an array` };
        return;
      }

      geotags = _.uniq(ctx.request.body.geotags);
    }

    if (type === 'short_text') {
      if ('text' in ctx.request.body) {
        post_object.set('text', ctx.request.body.text);
      }
    } else if (type === 'long_text') {
      if ('text' in ctx.request.body) {
        post_object.set('text', ctx.request.body.text);
      }

      if ('title' in ctx.request.body) {
        const more = post_object.get('more');
        more.title = ctx.request.body.title;
        post_object.set('more', more);
      }
    }

    // toJSON is important. It translates the date to UTC.
    post_object.attributes.updated_at = new Date().toJSON();

    if (!ctx.request.body.minor_update && !post_object.attributes.fully_published_at) {
      // Show post in the news feed.
      post_object.attributes.fully_published_at = new Date().toJSON();
    }

    try {
      await post_object.save(null, { method: 'update' });

      if (_.isArray(hashtags)) {
        await post_object.updateHashtags(hashtags);
      }

      if (_.isArray(schools)) {
        await post_object.updateSchools(schools);
      }

      if (_.isArray(geotags)) {
        await post_object.updateGeotags(geotags);
      }

      await post_object.fetch({ require: true, withRelated: POST_RELATIONS });
      post_object.relations.schools = post_object.relations.schools.map(row => ({ id: row.id, name: row.attributes.name, url_name: row.attributes.url_name }));

      ctx.body = post_object.toJSON();
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
      return;
    }
  };

  removePost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!('id' in ctx.params)) {
      ctx.status = 400;
      ctx.body = { error: '"id" parameter is not given' };
      return;
    }

    const Post = this.bookshelf.model('Post');

    try {
      const post_object = await Post.where({ id: ctx.params.id }).fetch({ require: true });

      if (post_object.get('user_id') != ctx.session.user) {
        ctx.status = 403;
        ctx.body = { error: 'You are not authorized' };
        return;
      }

      // reset post counters on attached tags and then destroy
      await post_object.detachAllTags();
      post_object.destroy();
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
      return;
    }
    ctx.status = 200;
    ctx.body = { success: true };
  };

  /**
   * Subscribes the current user to the specified post.
   * If subscribed, the current user recieves notifications about new comments on the post.
   */
  subscribeToPost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!('id' in ctx.params)) {
      ctx.status = 400;
      ctx.body = { error: '"id" parameter is not given' };
      return;
    }

    const Post = this.bookshelf.model('Post');

    try {
      const post = await Post.where({ id: ctx.params.id }).fetch({ require: true });

      await post.subscribers().attach(ctx.session.user);

      ctx.status = 200;
      ctx.body = { success: true };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
      return;
    }
  };

  unsubscribeFromPost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!('id' in ctx.params)) {
      ctx.status = 400;
      ctx.body = { error: '"id" parameter is not given' };
      return;
    }

    const Post = this.bookshelf.model('Post');

    try {
      const post = await Post.where({ id: ctx.params.id }).fetch({ require: true });

      await post.subscribers().detach(ctx.session.user);

      ctx.status = 200;
      ctx.body = { success: true };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
      return;
    }
  };

  getUnsubscribeFromPost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.redirect('/');
      return;
    }

    const Post = this.bookshelf.model('Post');

    try {
      const post = await Post.where({ id: ctx.params.id }).fetch({ require: true });

      await post.subscribers().detach(ctx.session.user);

      ctx.redirect(`/post/${post.id}`);
    } catch (e) {
      ctx.status = 500;
      ctx.body = 'Something went wrong';

      ctx.app.logger.error(e);

      return;
    }
  }

  getUser = async (ctx) => {
    const User = this.bookshelf.model('User');

    try {
      const u = await User
              .where({ username: ctx.params.username })
              .fetch({
                require: true,
                withRelated: USER_RELATIONS
              });
      ctx.body = u.toJSON();
    } catch (e) {
      ctx.status = 404;
      return;
    }
  };

  getFollowedUsers = async (ctx) => {
    const User = this.bookshelf.model('User');

    const users = await User.collection()
      .query(qb => {
        qb.join('followers', 'users.id', 'followers.following_user_id')
          .where('followers.user_id', ctx.params.id);
      })
      .fetch({
        withRelated: USER_RELATIONS
      });

    ctx.body = users;
  }

  getMutualFollows = async (ctx) => {
    const User = this.bookshelf.model('User');
    const knex = this.bookshelf.knex;

    // TODO: Is it possible to use joins insted of subqueries here? Which method is faster?
    const users = await User.collection()
      .query(qb => {
        qb
          .whereExists(function () {
            this.select('*')
              .from(knex.raw('followers as f2'))
              .whereRaw('f2.user_id = ?', ctx.params.id)
              .whereRaw('f2.following_user_id = users.id');
          })
          .whereExists(function () {
            this.select('*')
              .from(knex.raw('followers as f2'))
              .whereRaw('f2.following_user_id = ?', ctx.params.id)
              .whereRaw('f2.user_id = users.id');
          });

        this.applySortQuery(qb, ctx.query, 'username');
      })
      .fetch({
        withRelated: USER_RELATIONS
      });

    ctx.body = users;
  }

  followUser = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const User = this.bookshelf.model('User');
    const follow_status = { success: false };

    try {
      let user = await User.where({ id: ctx.session.user }).fetch({ require: true, withRelated: ['following', 'followers'] });
      let follow = await User.where({ username: ctx.params.username }).fetch({ require: true, withRelated: ['following', 'followers'] });

      if (user.id != follow.id && _.isUndefined(user.related('following').find({ id: follow.id }))) {
        await user.following().attach(follow);

        follow_status.success = true;
        user = await User.where({ id: ctx.session.user }).fetch({ require: true, withRelated: ['following', 'followers'] });
        follow = await User.where({ username: ctx.params.username }).fetch({ require: true, withRelated: ['following', 'followers'] });
      }

      follow_status.user1 = user.toJSON();
      follow_status.user2 = follow.toJSON();
    } catch (ex) {
      ctx.status = 500;
      follow_status.error = ex.message;
    }

    ctx.body = follow_status;
  };

  ignoreUser = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const User = this.bookshelf.model('User');

    const user = await User.where({ id: ctx.session.user }).fetch({ require: true, withRelated: ['ignored_users'] });
    const userToIgnore = await User.where({ username: ctx.params.username }).fetch({ require: true });

    await user.ignoreUser(userToIgnore.id);

    ctx.body = { success: true };
  };

  updateUser = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!ctx.request.body.more) {
      ctx.status = 400;
      ctx.body = { error: 'Bad Request' };
      return;
    }

    const checkit = new Checkit(UserValidators.settings.more);
    try {
      await checkit.run(ctx.request.body.more);
    } catch (e) {
      ctx.status = 400;
      ctx.body = { error: e.toJSON() };
      return;
    }

    const User = this.bookshelf.model('User');
    const ProfilePost = this.bookshelf.model('ProfilePost');

    try {
      const user = await User.where({ id: ctx.session.user }).fetch({ require: true });

      let properties = {};

      for (const fieldName in UserValidators.settings.more) {
        if (fieldName in ctx.request.body.more) {
          properties[fieldName] = ctx.request.body.more[fieldName];
        }
      }

      const newPictures = {};
      ['avatar', 'head_pic'].forEach(fieldName => {
        const updated = properties[fieldName];
        if (updated) {
          const old = user.get('more')[fieldName];
          if (!old) {
            newPictures[fieldName] = updated;
          } else if (updated.attachment_id !== old.attachment_id) {
            newPictures[fieldName] = updated;
          }
        }
      });

      properties = _.extend(user.get('more'), properties);
      user.set('more', properties);

      await user.save(null, { method: 'update' });

      await Promise.all(Object.keys(newPictures).map(type =>
        new ProfilePost({
          more: newPictures[type],
          user_id: ctx.session.user,
          type
        }).save(null, { method: 'insert' })
      ));

      ctx.body = { user };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: 'Update failed' };
      return;
    }
  };

  changePassword = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!('old_password' in ctx.request.body) || !('new_password' in ctx.request.body)) {
      ctx.status = 400;
      ctx.body = { error: '"old_password" or "new_password" parameter is not provided' };
      return;
    }

    const User = this.bookshelf.model('User');
    const PasswordChange = this.bookshelf.model('PasswordChange');

    try {
      const user = await User.where({ id: ctx.session.user }).fetch({ require: true });

      const passwordIsValid = await bcryptAsync.compareAsync(ctx.request.body.old_password, user.get('hashed_password'));

      if (!passwordIsValid) {
        ctx.status = 401;
        ctx.body = { error: 'old password is incorrect' };
        return;
      }

      const hashedPassword = await bcryptAsync.hashAsync(ctx.request.body.new_password, 10);
      const prevHashedPassword = user.get('hashed_password');

      user.set('hashed_password', hashedPassword);

      await user.save(null, { method: 'update' });

      await new PasswordChange({
        user_id: user.id,
        prev_hashed_password: prevHashedPassword,
        ip: ctx.ip,
        event_type: 'change'
      }).save();

      ctx.body = { success: true };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: 'Update failed' };
      return;
    }
  };

  unfollowUser = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const User = this.bookshelf.model('User');
    const follow_status = { success: false };

    try {
      let user = await User.where({ id: ctx.session.user }).fetch({ require: true, withRelated: ['following', 'followers'] });
      let follow = await User.where({ username: ctx.params.username }).fetch({ require: true, withRelated: ['following', 'followers'] });

      if (user.id != follow.id && !_.isUndefined(user.related('following').find({ id: follow.id }))) {
        await user.following().detach(follow);

        follow_status.success = true;
        user = await User.where({ id: ctx.session.user }).fetch({ require: true, withRelated: ['following', 'followers'] });
        follow = await User.where({ username: ctx.params.username }).fetch({ require: true, withRelated: ['following', 'followers'] });
      }

      follow_status.user1 = user.toJSON();
      follow_status.user2 = follow.toJSON();
    } catch (ex) {
      ctx.status = 500;
      follow_status.error = ex.message;
    }

    ctx.body = follow_status;
  };

  /**
   * Creates attachments from 'files'.
   * Important: set the 'name' property of each file input to 'files', not 'files[]' or 'files[0]'
   */
  uploadFiles = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!ctx.req.files || !ctx.req.files.length) {
      ctx.status = 400;
      ctx.body = { error: '"files" parameter is not provided' };
      return;
    }

    const Attachment = this.bookshelf.model('Attachment');

    try {
      const promises = ctx.req.files.map(file => {
        return Attachment.create(
          file.originalname,
          file.buffer,
          { user_id: ctx.session.user }
        );
      });

      const attachments = await Promise.all(promises);

      ctx.body = { success: true, attachments };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: `Upload failed: ${e.message}` };

      ctx.app.logger.error(e);
    }
  };

  /**
   * Loads the image from s3, transforms it and creates a new attachment with the new image
   * if derived_id is not specified.
   * If derived_id is specified then updates the attachment and responds with it.
   * Body params:
   *   original_id (required) - Id of the original attachment.
   *   transforms (required) - Json array with transforms. See utils/image.js processImage
   *   derived_id - Id of the attachment to reuse
   */
  processImage = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!ctx.request.body.original_id) {
      ctx.status = 400;
      ctx.body = { error: '"original_id" parameter is not provided' };
      return;
    }

    if (!ctx.request.body.transforms) {
      ctx.status = 400;
      ctx.body = { error: '"transforms" parameter is not provided' };
      return;
    }

    const Attachment = this.bookshelf.model('Attachment');

    try {
      let result;
      const transforms = JSON.parse(ctx.request.body.transforms);

      // Get the original attachment, checking ownership.
      const original = await Attachment
        .forge()
        .query(qb => {
          qb
            .where('id', ctx.request.body.original_id)
            .andWhere('user_id', ctx.session.user);
        })
        .fetch({ require: true });

      // Check if the format of the attachment is supported.
      const { supportedImageFormats } = config.attachments;
      if (supportedImageFormats.indexOf(original.attributes.mime_type) < 0) {
        ctx.status = 400;
        ctx.body = { error: 'Image type is not supported' };
        return;
      }

      // Download the original attachment data from s3.
      const originalData = await original.download();

      // Process the data.
      const imageBuffer = await processImageUtil(originalData.Body, transforms);

      // Update the attachment specified in derived_id or create a new one.
      if (ctx.request.body.derived_id) {
        const oldAttachment = await Attachment
          .forge()
          .query(qb => {
            qb
              .where('id', ctx.request.body.derived_id)
              .andWhere('user_id', ctx.session.user);
          })
          .fetch({ require: true });

        result = await oldAttachment.reupload(oldAttachment.attributes.filename, imageBuffer);
      } else {
        result = await Attachment.create(
          original.attributes.filename,
          imageBuffer,
          {
            user_id: original.attributes.user_id,
            original_id: original.id
          }
        );
      }

      ctx.body = { success: true, attachment: result };
    } catch (e) {
      if (e instanceof RangeError) {
        ctx.status = 400;
        ctx.body = { error: e.message };
      } else {
        ctx.status = 500;
        ctx.body = { error: `Image transformation failed: ${e.message}` };
      }
    }
  };

  pickpoint = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    try {
      const urlObj = parse_url(`https://pickpoint.io/api/v1/forward`);
      urlObj.query = { ...ctx.query, key: config.pickpoint.key };

      const response = await fetch(format_url(urlObj));
      const data = await response.json();

      ctx.body = data;
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
      return;
    }
  };

  /**
   * Returns 50 most popular hashtags sorted by post count.
   * Each hashtag in response contains post_count.
   */
  getTagCloud = async (ctx) => {
    const Hashtag = this.bookshelf.model('Hashtag');

    try {
      const hashtags = await Hashtag
        .collection()
        .query(qb => {
          qb
            .where('post_count', '>', '0')
            .orderByRaw('post_count DESC, name ASC');
        })
        .fetch({ require: true });

      ctx.body = hashtags;
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
      return;
    }
  };

  getSchoolCloud = async (ctx) => {
    const School = this.bookshelf.model('School');

    try {
      const schools = await School
        .collection()
        .query(qb => {
          qb
            .where('post_count', '>', '0')
            .orderByRaw('post_count DESC, name ASC')
            .limit(50);
        })
        .fetch({ require: true });

      ctx.body = schools;
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
    }
  };

  getGeotagCloud = async (ctx) => {
    const Geotag = this.bookshelf.model('Geotag');

    const continentCodes = [
      'EU', 'NA', 'SA', 'AF', 'AS', 'OC', 'AN'
    ];

    const geotagsByContinents = [];

    for (const code of continentCodes) {
      const count = await Geotag
        .collection()
        .query(qb => {
          qb
            .where('continent_code', code)
            .whereNot('type', 'Continent')
            .join('geotags_posts', 'geotags.id', 'geotags_posts.geotag_id');
        })
        .count();

      const geotags = await Geotag
        .collection()
        .query(qb => {
          qb
            .where('continent_code', code)
            .where('post_count', '>', '0')
            .whereNot('type', 'Continent')
            .orderByRaw('post_count DESC, name ASC')
            .limit(10);
        })
        .fetch();

      geotagsByContinents.push({
        continent_code: code,
        geotag_count: parseInt(count),
        geotags
      });
    }

    ctx.body = geotagsByContinents;
  };

  getUserRecentHashtags = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const Hashtag = this.bookshelf.model('Hashtag');

    const hashtags = await Hashtag
      .collection()
      .query(qb => {
        qb
          .join('hashtags_posts', 'hashtags.id', 'hashtags_posts.hashtag_id')
          .join('posts', 'hashtags_posts.post_id', 'posts.id')
          .where('posts.user_id', ctx.session.user)
          .groupBy('hashtags.id')
          .orderByRaw('MAX(posts.created_at) DESC')
          .limit(5);
      })
      .fetch();

    ctx.body = hashtags;
  };

  getUserRecentSchools = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const School = this.bookshelf.model('School');

    const schools = await School
      .collection()
      .query(qb => {
        qb
          .join('posts_schools', 'schools.id', 'posts_schools.school_id')
          .join('posts', 'posts_schools.post_id', 'posts.id')
          .where('posts.user_id', ctx.session.user)
          .groupBy('schools.id')
          .orderByRaw('MAX(posts.created_at) DESC')
          .limit(5);
      })
      .fetch();

    ctx.body = schools;
  };

  getUserRecentGeotags = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const Geotag = this.bookshelf.model('Geotag');

    const geotags = await Geotag
      .collection()
      .query(qb => {
        qb
          .join('geotags_posts', 'geotags.id', 'geotags_posts.geotag_id')
          .join('posts', 'geotags_posts.post_id', 'posts.id')
          .where('posts.user_id', ctx.session.user)
          .groupBy('geotags.id')
          .orderByRaw('MAX(posts.created_at) DESC')
          .limit(5);
      })
      .fetch();

    ctx.body = geotags;
  };

  followTag = async (ctx) => {
    const User = this.bookshelf.model('User');
    const Hashtag = this.bookshelf.model('Hashtag');

    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!ctx.params.name) {
      ctx.status = 400;
      ctx.body = { error: '"name" parameter is not given' };
      return;
    }

    try {
      const currentUser = await User.forge().where('id', ctx.session.user).fetch();
      const hashtag = await Hashtag.forge().where('name', ctx.params.name).fetch();

      await currentUser.followHashtag(hashtag.id);

      ctx.body = { success: true, hashtag };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
      return;
    }
  };

  unfollowTag = async (ctx) => {
    const User = this.bookshelf.model('User');
    const Hashtag = this.bookshelf.model('Hashtag');

    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!ctx.params.name) {
      ctx.status = 400;
      ctx.body = { error: '"name" parameter is not given' };
      return;
    }

    try {
      const currentUser = await User.forge().where('id', ctx.session.user).fetch();
      const hashtag = await Hashtag.forge().where('name', ctx.params.name).fetch();

      await currentUser.unfollowHashtag(hashtag.id);

      ctx.body = { success: true, hashtag };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
      return;
    }
  };

  followSchool = async (ctx) => {
    const User = this.bookshelf.model('User');
    const School = this.bookshelf.model('School');

    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!ctx.params.name) {
      ctx.status = 400;
      ctx.body = { error: '"name" parameter is not given' };
      return;
    }

    try {
      const currentUser = await User.forge().where('id', ctx.session.user).fetch();
      const school = await School.forge().where('url_name', ctx.params.name).fetch({ require: true });

      await currentUser.followSchool(school.id);

      ctx.body = { success: true, school };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
      return;
    }
  };

  unfollowSchool = async (ctx) => {
    const User = this.bookshelf.model('User');
    const School = this.bookshelf.model('School');

    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!ctx.params.name) {
      ctx.status = 400;
      ctx.body = { error: '"name" parameter is not given' };
      return;
    }

    try {
      const currentUser = await User.forge().where('id', ctx.session.user).fetch();
      const school = await School.forge().where('url_name', ctx.params.name).fetch({ require: true });

      await currentUser.unfollowSchool(school.id);

      ctx.body = { success: true, school };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
      return;
    }
  };

  followGeotag = async (ctx) =>  {
    const User = this.bookshelf.model('User');
    const Geotag = this.bookshelf.model('Geotag');

    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!ctx.params.url_name) {
      ctx.status = 400;
      ctx.body = { error: '"url_name" parameter is not given' };
      return;
    }

    try {
      const currentUser = await User.forge().where('id', ctx.session.user).fetch();
      const geotag = await Geotag.forge().where('url_name', ctx.params.url_name).fetch();

      await currentUser.followGeotag(geotag.id);

      ctx.body = { success: true, geotag };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
      return;
    }
  };

  unfollowGeotag = async (ctx) => {
    const User = this.bookshelf.model('User');
    const Geotag = this.bookshelf.model('Geotag');

    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!ctx.params.url_name) {
      ctx.status = 400;
      ctx.body = { error: '"url_name" parameter is not given' };
      return;
    }

    try {
      const currentUser = await User.forge().where('id', ctx.session.user).fetch();
      const geotag = await Geotag.forge().where('url_name', ctx.params.url_name).fetch();

      await currentUser.unfollowGeotag(geotag.id);

      ctx.body = { success: true, geotag };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
      return;
    }
  };

  checkGeotagExists = async (ctx) => {
    const Geotag = this.bookshelf.model('Geotag');

    try {
      await Geotag.where('name', ctx.params.name).fetch({ require: true });

      ctx.status = 200;
    } catch (e) {
      ctx.status = 404;
    }
  };

  getGeotag = async (ctx) => {
    const Geotag = this.bookshelf.model('Geotag');

    if (!ctx.params.url_name) {
      ctx.status = 400;
      ctx.body = { error: '"url_name" parameter is not given' };
      return;
    }

    try {
      const geotag = await Geotag
        .forge()
        .where('url_name', ctx.params.url_name)
        .fetch({ require: true, withRelated: ['country', 'admin1', 'continent', 'geonames_city'] });

      ctx.body = geotag;
    } catch (e) {
      ctx.status = 404;
      ctx.body = { error: e.message };
    }
  };

  getGeotags = async (ctx) => {
    const Geotag = this.bookshelf.model('Geotag');

    const ALLOWED_ATTRIBUTE_QUERIES = [
      'type',
      'country_code', 'continent_code',
      'continent_id', 'country_id', 'admin1_id',
      'name', 'url_name'
    ];

    const geotags = await Geotag.collection()
      .query(qb => {
        this.applyLimitQuery(qb, ctx.query, 10);
        this.applyOffsetQuery(qb, ctx.query, 0);
        this.applySortQuery(qb, ctx.query, 'url_name');
        qb.where(_.pick(ctx.query, ALLOWED_ATTRIBUTE_QUERIES));
      })
      .fetch();

    ctx.body = geotags;
  };

  getHashtag = async (ctx) => {
    const Hashtag = this.bookshelf.model('Hashtag');

    if (!ctx.params.name) {
      ctx.status = 400;
      ctx.body = { error: '"name" parameter is not given' };
      return;
    }

    try {
      const hashtag = await Hashtag
        .forge()
        .where('name', ctx.params.name)
        .fetch({ require: true });

      ctx.body = hashtag;
    } catch (e) {
      ctx.status = 404;
      ctx.body = { error: e.message };
    }
  };


  searchStats = async (ctx) => {
    const q = ctx.params.query;

    this.sphinx.api.SetMatchMode(4); //SPH_MATCH_EXTENDED
    this.sphinx.api.SetLimits(0, 100, 100, 100);

    try {
      const result = await this.sphinx.api.QueryAsync(`*${q}*`, 'PostsRT,UsersRT,HashtagsRT,GeotagsRT,SchoolsRT,CommentsRT');

      if ('matches' in result) {
        const result_count = _.countBy(result.matches, (value) => {
          const valueType = value.attrs.type.toLowerCase();
          return `${valueType}s`;
        });
        ctx.body = result_count;
      } else {
        ctx.body = {};
      }
    } catch (err) {
      ctx.status = 500;
      ctx.body = { error: JSON.stringify(err) };
    }
  };

  search = async (ctx) => {
    try {
      await new Checkit(SearchQueryValidators).run(ctx.query);
    } catch (e) {
      ctx.status = 400;
      ctx.body = { error: e.toJSON() };
      return;
    }

    const { show } = ctx.query;
    let indexes;
    if (typeof show === 'string') {
      if (show === 'all') {
        indexes = _.values(SEARCH_INDEXES_TABLE);
      } else {
        indexes = [SEARCH_INDEXES_TABLE[show]];
      }
    } else if (Array.isArray(show)) {
      indexes = _.values(_.pickBy(SEARCH_INDEXES_TABLE, (v, k) =>
        show.includes(k)
      ));
    } else {
      indexes = _.values(SEARCH_INDEXES_TABLE);
    }

    this.sphinx.api.SetMatchMode(4); // SphinxClient.SPH_MATCH_EXTENDED

    const limit = parseInt(ctx.query.limit, 10) || 20;
    const offset = parseInt(ctx.query.offset, 10) || 0;
    this.sphinx.api.SetLimits(offset, limit, offset + limit + 1000);

    if (!ctx.query.sort || ctx.query.sort === '-q') {
      this.sphinx.api.SetSortMode(0); // SphinxClient.SPH_SORT_RELEVANCE
    } else {
      this.sphinx.api.SetSortMode(1, 'updated_at'); // SphinxClient.SPH_SORT_ATTR_DESC
    }

    try {
      for (let i = 0, l = indexes.length, q = `*${ctx.query.q}*`; i < l; ++i) {
        this.sphinx.api.AddQuery(q, indexes[i]);
      }

      const results = await this.sphinx.api.RunQueriesAsync();
      const nonEmptyResults = results.filter(group => group.total_found > 0);

      if (nonEmptyResults.length > 0) {
        const processedGroups = await Promise.all(
          nonEmptyResults.map(group => {
            const type = group.matches[0].attrs.type,
              Model = this.bookshelf.model(type),
              ids   = group.matches.map(item => item.attrs.uuid);

            if (type === 'Post') {
              return Model.forge().query(qb => qb.whereIn('id', ids))
                .fetchAll({ require: false, withRelated: POST_RELATIONS })
                .then(posts => Promise.all([posts, this.countComments(posts)]))
                .then(([posts, postCommentsCount]) => {
                  const next = posts.map(post => {
                    post.relations.schools = post.relations.schools.map(row => ({
                      id: row.id,
                      name: row.attributes.name,
                      url_name: row.attributes.url_name
                    }));
                    post.attributes.comments = postCommentsCount[post.get('id')];
                    return post;
                  });
                  return hidePostsData(next, ctx, this.bookshelf.knex);
                })
                .then(posts => ({
                  [SEARCH_RESPONSE_TABLE[type]]: {
                    count: group.total_found,
                    items: posts
                  }
                }));
            }

            return Model.forge()
              .query(qb => qb.whereIn('id', ids)).fetchAll()
              .then(items => ({
                [SEARCH_RESPONSE_TABLE[type]]: {
                  count: group.total_found, items
                }
              }));
          }));

        ctx.body = processedGroups.reduce(
          (res, groupData) => Object.assign(res, groupData),
          {}
        );
      } else {
        ctx.status = 404;
      }
    } catch (err) {
      ctx.app.emit('error', err);

      ctx.status = 500;
      ctx.body = { error: `Search failed` };
    }
  };

  addToSearchIndex = async (index, data) => {
    const rt_index_name = `${index}sRT`;
    const next_index_meta = await this.sphinx.ql.raw(`SHOW INDEX ${rt_index_name} STATUS`);

    const next_id = ++next_index_meta[0][1]['Value'];

    data.uuid = data.id;
    data.id = next_id;
    data.type = index;

    return await this.sphinx.ql.insert(data).into(rt_index_name);
  };

  updateInSearchIndex = async (index, data) => {
    const rt_index_name = `${index}sRT`;
    const Model = this.bookshelf.model(index);
    const user = await Model.where({ id: data.id }).fetch({ require: true });

    const id = user.get('_sphinx_id');

    data.uuid = data.id;
    data.id = id;
    data.type = index;

    const q = this.sphinx.ql.insert(data).into(rt_index_name).toString();

    return await this.sphinx.ql.raw(q.replace(/insert into/i, 'replace into'));
  };

  searchGeotags = async (ctx) => {
    const query = ctx.params.query;

    try {
      const geotags = await this.getSimilarGeotags(query, ctx.query);

      ctx.body = { geotags };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
    }
  };

  searchHashtags = async (ctx) => {
    const query = ctx.params.query;

    try {
      const hashtags = await this.getSimilarHashtags(query);

      ctx.body = { hashtags };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
    }
  };

  searchSchools = async (ctx) => {
    const query = ctx.params.query;

    try {
      const schools = await this.getSimilarSchools(query);

      ctx.body = { schools };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
    }
  };

  getSimilarGeotags = async (query, queryParams) => {
    const Geotag = this.bookshelf.model('Geotag');
    const knex = this.bookshelf.knex;
    // Transform initial query into a string of tokens separated by the & operator.
    const finalQuery = query
      .replace(/(\||&|!|\(|\))/g, '') // remove operators
      .split(' ')
      .filter(t => !!t.length) // filter out empty tokens
      .map(t => `${t}:*`)
      .join(' & ');

    const geotags = await Geotag.collection().query((qb) => {
      qb
        .select(knex.raw(`*, ts_rank_cd('{1.0, 1.0, 0.8, 0.4}', tsv, query) as rank`))
        .from(knex.raw(`geotags, to_tsquery(?) query`, finalQuery))
        .whereRaw('tsv @@ query')
        .orderBy('rank', 'DESC')
        .limit(queryParams.limit || 10)
        .offset(queryParams.offset);
    }).fetch({ withRelated: ['country', 'admin1'] });

    return geotags;
  };

  getSimilarHashtags = async (query) => {
    const Hashtag = this.bookshelf.model('Hashtag');

    const hashtags = await Hashtag.collection().query(function (qb) {
      qb
        .where('name', 'ILIKE', `${query}%`)
        .limit(10);
    }).fetch();

    return hashtags;
  };

  getSimilarSchools = async (query) => {
    const School = this.bookshelf.model('School');

    const schools = await School.collection().query(function (qb) {
      qb
        .where('name', 'ILIKE', `${query}%`)
        .limit(10);
    }).fetch();

    return schools;
  };

  /**
   * Gets 3 related posts ordered by a number of matching tags + a random number between 0 and 3.
   */
  getRelatedPosts = async (ctx) => {
    function formatArray(array) {
      return `(${array.map(function (e) { return `'${e}'`; }).join(',')})`;
    }

    const knex = this.bookshelf.knex;
    const Post = this.bookshelf.model('Post');

    try {
      const post = await Post
        .forge()
        .where('id', ctx.params.id)
        .fetch({ withRelated: ['hashtags', 'geotags', 'schools'] });

      const hashtagIds = post.related('hashtags').pluck('id');
      const schoolIds = post.related('schools').pluck('id');
      const geotagIds = post.related('geotags').pluck('id');

      // I've tried `leftJoinRaw`, and `on(knex.raw())`.
      // Both trow `syntax error at or near "$1"`.
      let posts = await Post.collection().query(qb => {
        const countQueries = [];

        if (!_.isEmpty(hashtagIds)) {
          qb
            .leftJoin('hashtags_posts', 'posts.id', 'hashtags_posts.post_id')
            .leftJoin('hashtags', function () {
              this
                .on('hashtags_posts.hashtag_id', 'hashtags.id')
                .andOn(knex.raw(`hashtags.id IN ${formatArray(hashtagIds)}`));
            });

          countQueries.push('COUNT(DISTINCT hashtags.id)');
        }

        if (!_.isEmpty(schoolIds)) {
          qb
            .leftJoin('posts_schools', 'posts.id', 'posts_schools.post_id')
            .leftJoin('schools', function () {
              this
                .on('posts_schools.school_id', 'schools.id')
                .andOn(knex.raw(`schools.id IN ${formatArray(schoolIds)}`));
            });

          countQueries.push('COUNT(DISTINCT schools.id)');
        }

        if (!_.isEmpty(geotagIds)) {
          qb
            .leftJoin('geotags_posts', 'posts.id', 'geotags_posts.post_id')
            .leftJoin('geotags', function () {
              this
                .on('geotags_posts.geotag_id', 'geotags.id')
                .andOn(knex.raw(`geotags.id IN ${formatArray(geotagIds)}`));
            });

          countQueries.push('COUNT(DISTINCT geotags.id)');
        }

        qb
          .whereNot('posts.id', post.id)
          .groupBy('posts.id')
          .orderByRaw(`
            (${countQueries.join(' + ')} + random() * 3)
            DESC,
            fully_published_at DESC
          `)
          .limit(3);

        if (ctx.session.user) {
          qb.whereNot('posts.user_id', ctx.session.user);
        }
      }).fetch({ withRelated: POST_RELATIONS });
      const post_comments_count = await this.countComments(posts);
      posts = posts.map(post => {
        post.attributes.comments = post_comments_count[post.get('id')];
        return post;
      });
      ctx.body = posts;
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: 'Internal Server Error' };
      ctx.app.logger.error(e);
    }
  };

  likeHashtag = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const User = this.bookshelf.model('User');
    const Hashtag = this.bookshelf.model('Hashtag');
    const Post = this.bookshelf.model('Post');

    try {
      const user = await User.where({ id: ctx.session.user }).fetch({ require: true, withRelated: ['liked_hashtags'] });
      const hashtag = await Hashtag.where({ name: ctx.params.name }).fetch({ require: true });

      await user.liked_hashtags().detach(hashtag);
      await user.liked_hashtags().attach(hashtag);

      await new Post({
        id: uuid.v4(),
        fully_published_at: new Date().toJSON(),
        type: 'hashtag_like',
        liked_hashtag_id: hashtag.id,
        user_id: user.id
      }).save(null, { method: 'insert' });

      ctx.body = { success: true, hashtag };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: `Couldn't like the tag: ${e.message}` };
    }
  };

  unlikeHashtag = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const User = this.bookshelf.model('User');
    const Hashtag = this.bookshelf.model('Hashtag');
    const Post = this.bookshelf.model('Post');

    try {
      const user = await User.where({ id: ctx.session.user }).fetch({ require: true, withRelated: ['liked_hashtags'] });
      const hashtag = await Hashtag.where({ name: ctx.params.name }).fetch({ require: true });

      await user.liked_hashtags().detach(hashtag);

      await Post
        .where({
          user_id: user.id,
          liked_hashtag_id: hashtag.id
        })
        .destroy();

      ctx.body = { success: true, hashtag };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: `Couldn't unlike the tag: ${e.message}` };
    }
  };

  likeSchool = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const User = this.bookshelf.model('User');
    const School = this.bookshelf.model('School');
    const Post = this.bookshelf.model('Post');

    try {
      const user = await User.where({ id: ctx.session.user }).fetch({ require: true, withRelated: ['liked_hashtags'] });
      const school = await School.where({ url_name: ctx.params.url_name }).fetch({ require: true });

      await user.liked_schools().detach(school);
      await user.liked_schools().attach(school);

      await new Post({
        id: uuid.v4(),
        fully_published_at: new Date().toJSON(),
        type: 'school_like',
        liked_school_id: school.id,
        user_id: user.id
      }).save(null, { method: 'insert' });

      ctx.body = { success: true, school };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: `Couldn't like the school: ${e.message}` };
    }
  };

  unlikeSchool = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const User = this.bookshelf.model('User');
    const School = this.bookshelf.model('School');
    const Post = this.bookshelf.model('Post');

    try {
      const user = await User.where({ id: ctx.session.user }).fetch({ require: true, withRelated: ['liked_hashtags'] });
      const school = await School.where({ url_name: ctx.params.url_name }).fetch({ require: true });

      await user.liked_schools().detach(school);

      await Post
        .where({
          user_id: user.id,
          liked_school_id: school.id
        })
        .destroy();

      ctx.body = { success: true, school };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: `Couldn't unlike the school: ${e.message}` };
    }
  };

  likeGeotag = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const User = this.bookshelf.model('User');
    const Geotag = this.bookshelf.model('Geotag');
    const Post = this.bookshelf.model('Post');

    try {
      const user = await User.where({ id: ctx.session.user }).fetch({ require: true, withRelated: ['liked_hashtags'] });
      const geotag = await Geotag.where({ url_name: ctx.params.url_name }).fetch({ require: true });

      await user.liked_geotags().detach(geotag);
      await user.liked_geotags().attach(geotag);

      await new Post({
        id: uuid.v4(),
        fully_published_at: new Date().toJSON(),
        type: 'geotag_like',
        liked_geotag_id: geotag.id,
        user_id: user.id
      }).save(null, { method: 'insert' });

      ctx.body = { success: true, geotag };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: `Couldn't like the geotag: ${e.message}` };
    }
  };

  unlikeGeotag = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const User = this.bookshelf.model('User');
    const Geotag = this.bookshelf.model('Geotag');
    const Post = this.bookshelf.model('Post');

    try {
      const user = await User.where({ id: ctx.session.user }).fetch({ require: true, withRelated: ['liked_hashtags'] });
      const geotag = await Geotag.where({ url_name: ctx.params.url_name }).fetch({ require: true });

      await user.liked_geotags().detach(geotag);

      await Post
        .where({
          user_id: user.id,
          liked_geotag_id: geotag.id
        })
        .destroy();

      ctx.body = { success: true, geotag };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: `Couldn't unlike the geotag: ${e.message}` };
    }
  };

  getQuotes = async (ctx) => {
    const Quote = this.bookshelf.model('Quote');

    const quotes = await Quote
      .collection()
      .query(qb => {
        qb.orderBy('last_name');
      })
      .fetch();

    ctx.body = quotes;
  };

  getPostComments = async (ctx) => {
    const Comment = this.bookshelf.model('Comment');
    const q = Comment.forge()
      .query(qb => {
        qb
          .where('post_id', '=', ctx.params.id)
          .orderBy('created_at', 'asc');
      });

    const comments = await q.fetchAll({ require: false, withRelated: ['user'] });

    ctx.body = comments;
  };

  postComment = async (ctx) => {
    const Comment = this.bookshelf.model('Comment');
    const Post = this.bookshelf.model('Post');

    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    let post_object;

    try {
      post_object = await Post.where({ id: ctx.params.id }).fetch({ require: true });
    } catch (e) {
      ctx.status = 404;
      return;
    }

    if (!('text' in ctx.request.body) || !ctx.request.body.text) {
      ctx.status = 400;
      ctx.body = { error: 'Comment text cannot be empty' };
      return;
    }

    const comment_text = ctx.request.body.text.trim();

    const comment_object = new Comment({
      id: uuid.v4(),
      post_id: ctx.params.id,
      user_id: ctx.session.user,
      text: comment_text
    });

    post_object.attributes.updated_at = new Date().toJSON();

    try {
      await comment_object.save(null, { method: 'insert' });
      await post_object.save(null, { method: 'update' });

      this.queue.createJob('on-comment', { commentId: comment_object.id });

      await this.getPostComments(ctx);
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
    }

    // FIXME: this should be moved to kue-task
    try {
      await this.addToSearchIndex('Comment', comment_object.toJSON());
    } catch (e) {
      ctx.app.logger.error(`Failed to add comment to search-index: ${e}`);
    }
  };

  editComment = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const Post = this.bookshelf.model('Post');
    const Comment = this.bookshelf.model('Comment');

    let post_object;
    let comment_object;

    try {
      post_object = await Post.where({ id: ctx.params.id }).fetch({ require: true });
      comment_object = await Comment.where({
        id: ctx.params.comment_id,
        post_id: ctx.params.id
      }).fetch({ require: true });
    } catch (e) {
      ctx.status = 404;
      return;
    }

    if (comment_object.get('user_id') != ctx.session.user)  {
      ctx.status = 403;
    }

    if (!('text' in ctx.request.body) || ctx.request.body.text.trim().length === 0) {
      ctx.status = 400;
      ctx.body = { error: 'Comment text cannot be empty' };
      return;
    }

    const comment_text = ctx.request.body.text.trim();

    comment_object.set('text', comment_text);
    comment_object.set('updated_at', new Date().toJSON());
    post_object.attributes.updated_at = new Date().toJSON();

    await comment_object.save(null, { method: 'update' });
    await post_object.save(null, { method: 'update' });
    await this.getPostComments(ctx);
  };

  removeComment = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    if (!('id' in ctx.params) || !('comment_id' in ctx.params)) {
      ctx.status = 400;
      ctx.body = { error: '"id" parameter is not given' };
      return;
    }

    const Post = this.bookshelf.model('Post');
    const Comment = this.bookshelf.model('Comment');

    let post_object, comment_object;
    try {
      post_object = await Post.where({ id: ctx.params.id }).fetch({ require: true });
      comment_object = await Comment.where({ id: ctx.params.comment_id, post_id: ctx.params.id }).fetch({ require: true });
    } catch (e) {
      ctx.status = 404;
      return;
    }

    try {
      if (comment_object.get('user_id') != ctx.session.user) {
        ctx.status = 403;
        ctx.body = { error: 'You are not authorized' };
        return;
      }

      await comment_object.destroy();
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
      return;
    }

    post_object.attributes.updated_at = new Date().toJSON();

    await post_object.save(null, { method: 'update' });
    await this.getPostComments(ctx);
  };

  sendMessage = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const areMutuallyFollowed = await this.areMutuallyFollowed(ctx.session.user, ctx.params.id);
    if (!areMutuallyFollowed) {
      ctx.status = 403;
      ctx.body = { error: 'You must be mutually followed with this user to be able to message them' };
      return;
    }

    try {
      await new Checkit(UserMessageValidators).run(ctx.request.body);
    } catch (e) {
      ctx.status = 400;
      ctx.body = { error: e.toJSON() };
      return;
    }

    const User = this.bookshelf.model('User');

    const currentUser = await new User({ id: ctx.session.user }).fetch({ require: true });
    const message = await currentUser.outbox().create({
      reciever_id: ctx.params.id,
      text: ctx.request.body.text
    });

    ctx.body = await message.fetch();
  }

  /**
   * Gets a chain of messages between the current user and the specified in params.
   */
  getUserMessages = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const UserMessage = this.bookshelf.model('UserMessage');

    const messages = await UserMessage.collection()
      .query(qb => {
        qb
          .where({ sender_id: ctx.session.user, reciever_id: ctx.params.id })
          .orWhere({ sender_id: ctx.params.id, reciever_id: ctx.session.user })
          .orderBy('created_at', 'ASC');
      })
      .fetch();
    await UserMessage.collection()
      .query(qb => {
        qb
          .where({ sender_id: ctx.session.user, reciever_id: ctx.params.id })
          // TODO: Replace with a single orWhere() when knex is upgraded from 0.10
          .orWhere({ sender_id: ctx.params.id })
          .andWhere({ reciever_id: ctx.session.user })
          .orderBy('created_at', 'ASC');
      })
      .fetch();

    ctx.body = messages;
  }

  getProfilePosts = async (ctx) => {
    const User = this.bookshelf.model('User');

    try {
      const user = await new User({ username: ctx.params.username }).fetch({ require: true });
      const offset = ('offset' in ctx.query) ? parseInt(ctx.query.offset, 10) : 0;
      const limit = ('limit' in ctx.query) ? parseInt(ctx.query.limit, 10) : 10;
      const posts = await user.profile_posts()
        .query(qb => {
          qb
            .offset(offset)
            .limit(limit)
            .orderBy('updated_at', 'desc');
        }).fetch();

      ctx.body = posts;
    } catch (e) {
      this.processError(ctx, e);
    }
  }

  getProfilePost = async (ctx) => {
    const ProfilePost = this.bookshelf.model('ProfilePost');

    try {
      const post = await new ProfilePost({ id: ctx.params.id })
        .fetch({ require: true });

      ctx.body = post;
    } catch (e) {
      this.processError(ctx, e);
    }
  }

  createProfilePost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const ProfilePost = this.bookshelf.model('ProfilePost');

    const postAttrs = _.pick(ctx.request.body, ['text', 'type', 'more']);
    postAttrs.user_id = ctx.session.user;

    const post = new ProfilePost(postAttrs);
    if (postAttrs.type === 'text' && !postAttrs.text.trim()) {
      ctx.status = 400;
      ctx.body = { error: 'Profile post\'s text is missing' };
      return;
    }

    try {
      await post.save();
      ctx.body = await post.fetch();
    } catch (e) {
      this.processError(ctx, e);
    }
  }

  updateProfilePost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = { error: 'You are not authorized' };
      return;
    }

    const ProfilePost = this.bookshelf.model('ProfilePost');

    try {
      const post = await new ProfilePost()
        .where({ id: ctx.params.id, user_id: ctx.session.user })
        .fetch({ require: true });

      post.set(_.pick(ctx.request.body, ['text', 'type', 'more']));
      post.renderMarkdown();
      post.set('updated_at', new Date().toJSON());

      await post.save(null, { method: 'update' });
      ctx.body = await post.refresh();
    } catch (e) {
      this.processError(ctx, e);
    }
  }

  deleteProfilePost = async (ctx) => {
    const ProfilePost = this.bookshelf.model('ProfilePost');

    try {
      await new ProfilePost({ id: ctx.params.id, user_id: ctx.session.user })
        .destroy({ require: true });

      ctx.body = {
        success: true
      };
    } catch (e) {
      this.processError(ctx, e);
    }
  }

  getLocale = async (ctx) => {
    const { lang_code } = ctx.params;

    if (!SUPPORTED_LOCALES.find(c => lang_code === c)) {
      ctx.status = 404;
      ctx.body = { error: 'Locale isn\'t supported' };
      return;
    }

    try {
      // eslint-disable-next-line prefer-template
      const locale = require('../../res/locale/' + lang_code + '.json');

      ctx.status = 200;
      ctx.body = locale;
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e.message };
    }
  };

  // ========== Helpers ==========

  /**
   * Sets the response body in case of error
   * ```
   * {
   *   errors: { fieldName: ['Some message']] }, // Only if e is a Checkit.Error
   *   error: 'Human readable message'
   * }
   * ```
   * @param ctx Koa context
   * @param {Error} e
   */
  processError(ctx, e) {
    if (e instanceof Checkit.Error) {
      ctx.status = 400;
      ctx.body = {
        errors: e.toJSON(),
        error: e.toString()
      };
    } else if (
      e instanceof this.bookshelf.NotFoundError ||
      e instanceof this.bookshelf.NoRowsUpdatedError ||
      e instanceof this.bookshelf.NoRowsDeletedError
    ) {
      ctx.status = 404;
      ctx.body = {
        error: 'Not Found'
      };
    } else {
      ctx.app.logger.error(e);
      ctx.status = 500;
      ctx.body = {
        error: e.message
      };
    }
  }

  async areMutuallyFollowed(user1Id, user2Id) {
    const knex = this.bookshelf.knex;

    const userFollows = await knex('followers')
      .where({ user_id: user1Id, following_user_id: user2Id })
      .count();
    const userBeingFollowed = await knex('followers')
      .where({ user_id: user2Id, following_user_id: user1Id })
      .count();

    return parseInt(userFollows[0].count, 10) > 0 && parseInt(userBeingFollowed[0].count, 10) > 0;
  }

  countComments = async (posts) => {
    const ids = posts.map(post => {
      return post.get('id');
    });

    if (ids.length < 1) {
      return {};
    }
    const Comment = this.bookshelf.model('Comment');
    const q = Comment.forge()
      .query(qb => {
        qb
          .select('post_id')
          .count('id as comment_count')
          .where('post_id', 'IN', ids)
          .groupBy('post_id');
      });

    const raw_counts = await q.fetchAll();

    const mapped_counts = _.mapValues(_.keyBy(raw_counts.toJSON(), 'post_id'), (item => {
      return parseInt(item.comment_count);
    }));

    const missing = _.difference(ids, _.keys(mapped_counts));

    const zeroes = _.fill(_.clone(missing), 0, 0, missing.length);
    return _.merge(_.zipObject(missing, zeroes), mapped_counts);
  };

  /**
   * Sets 'order by' for the {@link qb} depending on the 'sort' query parameter.
   * Syntax: `?sort=column1,-column2,column3`
   * @param qb Knex query builder.
   * @param {Object} query An object containing query parameters.
   */
  applySortQuery(qb, query, defaultValue = null) {
    if ('sort' in query || defaultValue) {
      const columns = (query.sort || defaultValue).split(',');

      const queryString = columns.map(column => {
        let order = 'ASC';

        if (column[0] == '-') {
          column = column.substring(1);
          order = 'DESC';
        }

        return `${column} ${order}`;
      }).join(', ');

      qb.orderByRaw(queryString);
    }
  }

  applyStartsWithQuery(qb, query) {
    if ('startsWith' in query) {
      qb.where('name', 'ILIKE', `${query.startsWith}%`);
    }
  }

  applyLimitQuery(qb, query, defaultValue = null) {
    if ('limit' in query || defaultValue) {
      qb.limit(query.limit || defaultValue);
    }
  }

  applyOffsetQuery(qb, query, defaultValue = null) {
    if ('offset' in query || defaultValue) {
      qb.offset(query.offset || defaultValue);
    }
  }

  async cleanUpPosts(posts) {
    const commentCounts = await this.countComments(posts);
    // Copied from `subscriptions`. There must be a better way to filter out properties.
    return posts.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({ id: row.id, name: row.attributes.name, url_name: row.attributes.url_name }));
      post.attributes.comments = commentCounts[post.get('id')];
      return post;
    });
  }
}
