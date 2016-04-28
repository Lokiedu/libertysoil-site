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
import _ from 'lodash'
import bcrypt from 'bcrypt'
import bb from 'bluebird'
import { countBreaks } from 'grapheme-breaker';
import uuid from 'uuid'
import slug from 'slug';
import request from 'superagent';
import crypto from 'crypto'
import Checkit from 'checkit';

import QueueSingleton from '../utils/queue';
import { processImage } from '../utils/image';
import config from '../../config';
import {
  User as UserValidators,
  School as SchoolValidators,
  Hashtag as HashtagValidators,
  Geotag as GeotagValidators
} from './db/validators';


let bcryptAsync = bb.promisifyAll(bcrypt);
const POST_RELATIONS = Object.freeze([
  'user', 'likers', 'favourers', 'hashtags', 'schools',
  'geotags', 'liked_hashtag', 'liked_school', 'liked_geotag',
  {post_comments: qb => qb.orderBy('created_at')}, 'post_comments.user'
]);

export default class ApiController {
  bookshelf;
  queue;

  constructor(bookshelf) {
    this.bookshelf = bookshelf;
    this.queue = new QueueSingleton;
  }

  test = async (ctx) => {
    ctx.body = 'test message in response';
  };

  allPosts = async (ctx) => {
    let Posts = this.bookshelf.collection('Posts');
    let posts = new Posts();
    let response = await posts.fetch({require: false, withRelated: POST_RELATIONS});
    response = response.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      return post;
    });

    ctx.body = response;
  };

  userPosts = async (ctx) => {
    let Post = this.bookshelf.model('Post');

    let q = Post.forge()
      .query(qb => {
        qb
          .join('users', 'users.id', 'posts.user_id')
          .where('users.username', '=', ctx.params.user)
          .orderBy('posts.updated_at', 'desc')
          .whereIn('posts.type', ['short_text', 'long_text']);
      });


    let posts = await q.fetchAll({require: false, withRelated: POST_RELATIONS});

    let post_comments_count = await this.countComments(posts);

    posts = posts.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      post.attributes.comments = post_comments_count[post.get('id')];
      return post;
    });

    ctx.body = posts;
  };

  tagPosts = async (ctx) => {
    let Post = this.bookshelf.model('Post');

    let q = Post.forge()
      .query(qb => {
        qb
          .join('hashtags_posts', 'posts.id', 'hashtags_posts.post_id')
          .join('hashtags', 'hashtags_posts.hashtag_id', 'hashtags.id')
          .where('hashtags.name', '=', ctx.params.tag)
          .orderBy('posts.created_at', 'desc')
      });

    let posts = await q.fetchAll({require: false, withRelated: POST_RELATIONS});

    let post_comments_count = await this.countComments(posts);

    posts = posts.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      post.attributes.comments = post_comments_count[post.get('id')];
      return post;
    });

    ctx.body = posts;
  };

  schoolPosts = async (ctx) => {
    let Post = this.bookshelf.model('Post');

    let q = Post.collection()
      .query(qb => {
        qb
          .join('posts_schools', 'posts.id', 'posts_schools.post_id')
          .join('schools', 'posts_schools.school_id', 'schools.id')
          .where('schools.url_name', ctx.params.school)
          .andWhere('posts_schools.visible', true)
          .orderBy('posts.created_at', 'desc');
      });

    let posts = await q.fetch({withRelated: POST_RELATIONS});
    let post_comments_count = await this.countComments(posts);

    posts = posts.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      post.attributes.comments = post_comments_count[post.get('id')];
      return post;
    });

    ctx.body = posts;
  };

  geotagPosts = async (ctx) => {
    const Post = this.bookshelf.model('Post');
    const Geotag = this.bookshelf.model('Geotag');

    try {
      const geotag = await Geotag
        .forge()
        .where({url_name: ctx.params.url_name})
        .fetch({require: true});

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
         .fetch({withRelated: POST_RELATIONS});

      let post_comments_count = await this.countComments(posts);

      posts = posts.map(post => {
        post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
        post.attributes.comments = post_comments_count[post.get('id')];
        return post;
      });

      ctx.body = posts;
    } catch (e) {
      ctx.status = 404;
      return;
    }
  };

  userTags = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403
      ctx.body = {error: 'You are not authorized'};
      return;
    }
    let Hashtag = this.bookshelf.model('Hashtag');
    let hashtags = await Hashtag
      .collection()
      .query(qb => {
        qb
          .join('hashtags_posts', 'hashtags_posts.hashtag_id', 'hashtags.id')
          .join('posts', 'hashtags_posts.post_id', 'posts.id')
          .where('posts.user_id', ctx.session.user)
          .distinct()
      })
      .fetch();

    let School = this.bookshelf.model('School');
    let schools = await School
      .collection()
      .query(qb => {
        qb
          .join('posts_schools', 'posts_schools.school_id', 'schools.id')
          .join('posts', 'posts_schools.post_id', 'posts.id')
          .where('posts.user_id', ctx.session.user)
          .distinct()
      })
      .fetch();

    let Geotag = this.bookshelf.model('Geotag');
    let geotags = await Geotag
      .collection()
      .query(qb => {
        qb
          .join('geotags_posts', 'geotags_posts.geotag_id', 'geotags.id')
          .join('posts', 'geotags_posts.post_id', 'posts.id')
          .where('posts.user_id', ctx.session.user)
          .distinct()
      })
      .fetch();

    ctx.body = { hashtags, schools, geotags };
  };

  getPost = async (ctx) => {
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: ctx.params.id}).fetch({require: true, withRelated: POST_RELATIONS});

      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      post.attributes.comments = post.relations.post_comments.length;

      ctx.body = post.toJSON();
    } catch (e) {
      ctx.status = 404;
      return;
    }
  };

  currentUserLikedPosts = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    try {
      let posts = await this.getLikedPosts(ctx.session.user);
      ctx.body = posts;
    } catch (e) {
      ctx.status = 500;
      ctx.body = e.message;
    }
  };

  userLikedPosts = async (ctx) =>  {
    try {
      let user_id = await this.bookshelf.knex
        .select('id')
        .from('users')
        .where('users.username', '=', ctx.params.user)
        .map(row => row.id);

      let posts = await this.getLikedPosts(user_id[0]);
      ctx.body = posts;
    } catch (e) {
      ctx.status = 500;
      ctx.body = e.message;
    }
  };

  getLikedPosts = async (userId) => {
    let Post = this.bookshelf.model('Post');

    let likes = await this.bookshelf.knex
      .select('post_id')
      .from('likes')
      .where({user_id: userId})
      .map(row => row.post_id);

    let q = Post.forge()
    .query(qb => {
      qb
        .select()
        .from('posts')
        .whereIn('id', likes)
        .union(function() {
          this
            .select()
            .from('posts')
            .whereIn('type', ['hashtag_like', 'school_like', 'geotag_like'])
            .andWhere('user_id', userId);
        })
        .orderBy('updated_at', 'desc');
    });

    let posts = await q.fetchAll({require: false, withRelated: POST_RELATIONS});
    let post_comments_count = await this.countComments(posts);
    posts = posts.map(post => {
      post.attributes.comments = post_comments_count[post.get('id')];
      return post;
    });

    return posts;
  };

  currentUserFavouredPosts = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    try {
      let posts = await this.getFavouredPosts(ctx.session.user);
      ctx.body = posts;
    } catch (e) {
      ctx.status = 500;
      ctx.body = e.message;
    }
  };

  userFavouredPosts = async (ctx) => {
    try {
      let user_id = await this.bookshelf.knex
        .select('id')
        .from('users')
        .where('users.username', '=', ctx.params.user)
        .map(row => row.id);

      let posts = await this.getFavouredPosts(user_id[0]);
      ctx.body = posts;
    } catch (e) {
      ctx.status = 500;
      ctx.body = e.message;
    }
  };

  getFavouredPosts = async (userId) => {
    let Post = this.bookshelf.model('Post');

    let favourites = await this.bookshelf.knex
      .select('post_id')
      .from('favourites')
      .where({user_id: userId})
      .map(row => row.post_id);

    let q = Post.forge()
    .query(qb => {
      qb
        .whereIn('id', favourites)
        .orderBy('posts.updated_at', 'desc')
    });

    let posts = await q.fetchAll({require: false, withRelated: POST_RELATIONS});
    let post_comments_count = await this.countComments(posts);
    posts = posts.map(post => {
      post.attributes.comments = post_comments_count[post.get('id')];
      return post;
    });

    return posts;
  };

  checkSchoolExists = async (ctx) => {
    let School = this.bookshelf.model('School');

    try {
      await School.where('name', ctx.params.name).fetch({require: true});

      ctx.status = 200;
    } catch (e) {
      ctx.status = 404;
    }
  };

  getSchool = async (ctx) => {
    let School = this.bookshelf.model('School');

    try {
      let school = await School
        .where({url_name: ctx.params.url_name})
        .fetch({require: true, withRelated: 'images'});

      ctx.body = school.toJSON();
    } catch (e) {
      ctx.status = 404
      return;
    }
  };

  getSchools = async (ctx) => {
    let School = this.bookshelf.model('School');

    try {
      let schools = await School.fetchAll({withRelated: 'images'});
      ctx.body = schools.toJSON();
    } catch (e) {
      ctx.status = 404;
      return;
    }
  };

  getCountries = async (ctx) => {
    const Geotag = this.bookshelf.model('Geotag');

    try {
      let countries = await Geotag.where({ type: 'Country' }).fetchAll();
      ctx.body = countries.toJSON();
    } catch (e) {
      ctx.status = 404
      return;
    }
  };

  getCountry = async (ctx) => {
    let Country = this.bookshelf.model('Country');

    try {
      let country = await Country.where({iso_alpha2: ctx.params.code}).fetch();
      ctx.body = country.toJSON();
    } catch (e) {
      ctx.status = 404
      return;
    }
  };

  getCity = async (ctx) => {
    let City = this.bookshelf.model('City');

    try {
      let city = await City.where({id: ctx.params.id}).fetch();
      ctx.body = city.toJSON();
    } catch (e) {
      ctx.status = 404
      return;
    }
  };

  updateGeotag = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    if (!('id' in ctx.params)) {
      ctx.status = 400;
      ctx.body = {error: '"id" parameter is not given'};
      return;
    }

    let checkit = new Checkit(GeotagValidators.more);
    
    try {
      await checkit.run(ctx.request.body.more);
    } catch (e) {
      ctx.status = 400;
      ctx.body = {error: e.toJSON()};
      return;
    }

    try {
      let Geotag = this.bookshelf.model('Geotag');
      let geotag = await Geotag.where({id: ctx.params.id}).fetch({require: true});

      let properties = {};
      for (let fieldName in GeotagValidators.more) {
        if (fieldName in ctx.request.body.more) {
          properties[fieldName] = ctx.request.body.more[fieldName];
        }
      }

      properties.last_editor = ctx.session.user;
      properties = _.extend(geotag.get('more'), properties);
      
      geotag.set('more', properties);
      await geotag.save(null, {method: 'update'});

      ctx.body = geotag;
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: 'Update failed'};
      return;
    }
  };

  updateHashtag = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    if (!('id' in ctx.params)) {
      ctx.status = 400;
      ctx.body = {error: '"id" parameter is not given'};
      return;
    }

    let checkit = new Checkit(HashtagValidators.more);
    
    try {
      await checkit.run(ctx.request.body.more);
    } catch (e) {
      ctx.status = 400;
      ctx.body = {error: e.toJSON()};
      return;
    }

    try {
      let Hashtag = this.bookshelf.model('Hashtag');
      let hashtag = await Hashtag.where({id: ctx.params.id}).fetch({require: true});

      let properties = {};
      for (let fieldName in HashtagValidators.more) {
        if (fieldName in ctx.request.body.more) {
          properties[fieldName] = ctx.request.body.more[fieldName];
        }
      }

      properties.last_editor = ctx.session.user;
      properties = _.extend(hashtag.get('more'), properties);
      
      hashtag.set('more', properties);
      await hashtag.save(null, {method: 'update'});

      ctx.body = hashtag;
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: 'Update failed'};
      return;
    }
  };

  updateSchool = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    if (!('id' in ctx.params)) {
      ctx.status = 400;
      ctx.body = {error: '"id" parameter is not given'};
      return;
    }

    let School = this.bookshelf.model('School');

    try {
      const school = await School.where({ id: ctx.params.id }).fetch({ require: true, withRelated: 'images' });

      const allowedAttributes = [
        'name', 'description',
        'lat', 'lon',
        'is_open', 'principal_name', 'principal_surname',
        'foundation_year', 'foundation_month', 'foundation_day',
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

        return data;
      };

      const attributesWithValues = processData(_.pick(ctx.request.body, allowedAttributes));

      let properties = {};
      for (let fieldName in SchoolValidators.more) {
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
          ctx.body = {error: `"images" parameter is expected to be an array`};
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
      languages = school.get('required_languages')
      if (_.isArray(languages)) {
        school.set('required_languages', JSON.stringify(languages));
      }

      await school.save();

      ctx.body = school;
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
    }
  };

  likePost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let result = { success: false };

    let User = this.bookshelf.model('User');
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: ctx.params.id}).fetch({require: true});
      let user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['liked_posts']});

      if (post.get('user_id') === user.id) {
        ctx.status = 403;
        ctx.body = {error: "You can't like your own post"};
        return;
      }

      await user.liked_posts().attach(post);

      post.attributes.updated_at = new Date().toJSON();
      await post.save(null, {method: 'update'});

      post = await Post.where({id: ctx.params.id}).fetch({require: true, withRelated: ['likers']});

      let likes = await this.bookshelf.knex
        .select('post_id')
        .from('likes')
        .where({user_id: ctx.session.user});

      result.success = true;
      result.likes = likes.map(row => row.post_id);
      result.likers = post.relations.likers;
    } catch (ex) {
      ctx.status = 500;
      result.error = ex.message;
    }

    ctx.body = result;
  };

  unlikePost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let result = { success: false };

    let User = this.bookshelf.model('User');
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: ctx.params.id}).fetch({require: true});
      let user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['liked_posts']});

      await user.liked_posts().detach(post);

      post.attributes.updated_at = new Date().toJSON();
      await post.save(null, {method: 'update'});

      post = await Post.where({id: ctx.params.id}).fetch({require: true, withRelated: ['likers']});

      let likes = await this.bookshelf.knex
        .select('post_id')
        .from('likes')
        .where({user_id: ctx.session.user});

      result.success = true;
      result.likes = likes.map(row => row.post_id);
      result.likers = post.relations.likers;
    } catch (ex) {
      ctx.status = 500;
      result.error = ex.message;
    }

    ctx.body = result;
  };

  favPost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let result = { success: false };

    let User = this.bookshelf.model('User');
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: ctx.params.id}).fetch({require: true});
      let user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['favourited_posts']});

      if (post.get('user_id') === user.id) {
        ctx.status = 403;
        ctx.body = {error: "You can't add your own post to favorites"};
        return;
      }

      await user.favourited_posts().attach(post);

      post = await Post.where({id: ctx.params.id}).fetch({require: true, withRelated: ['favourers']});

      let favs = await this.bookshelf.knex
        .select('post_id')
        .from('favourites')
        .where({user_id: ctx.session.user});

      result.success = true;
      result.favourites = favs.map(row => row.post_id);
      result.favourers = post.relations.favourers;
    } catch (ex) {
      ctx.status = 500;
      result.error = ex.message;
    }

    ctx.body = result;
  };

  unfavPost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let result = { success: false };

    let User = this.bookshelf.model('User');
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: ctx.params.id}).fetch({require: true});
      let user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['favourited_posts']});

      await user.favourited_posts().detach(post);

      post = await Post.where({id: ctx.params.id}).fetch({require: true, withRelated: ['favourers']});

      let favs = await this.bookshelf.knex
        .select('post_id')
        .from('favourites')
        .where({user_id: ctx.session.user});

      result.success = true;
      result.favourites = favs.map(row => row.post_id);
      result.favourers = post.relations.favourers;
    } catch (ex) {
      ctx.status = 500;
      result.error = ex.message;
    }

    ctx.body = result;
  };

  subscriptions = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let uid = ctx.session.user;
    let Post = this.bookshelf.model('Post');

    const offset = ('offset' in ctx.query) ? parseInt(ctx.query.offset, 10) : 0;

    let q = Post.forge()
      .query(qb => {
        qb
          .leftJoin('followers', 'followers.following_user_id', 'posts.user_id')
          .whereRaw('(followers.user_id = ? OR posts.user_id = ?)', [uid, uid])  // followed posts
          .whereRaw('(posts.fully_published_at IS NOT NULL OR posts.user_id = ?)', [uid]) // only major and own posts
          .orderBy('posts.updated_at', 'desc')
          .groupBy('posts.id')
          .limit(5)
          .offset(offset)
      });

    let posts = await q.fetchAll({require: false, withRelated: POST_RELATIONS});
    let post_comments_count = await this.countComments(posts);
    posts = posts.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      post.attributes.comments = post_comments_count[post.get('id')];
      return post;
    });

    ctx.body = posts;
  };

  checkUserExists = async (ctx) => {
    let User = this.bookshelf.model('User');

    try {
      await User
        .forge()
        .where('username', ctx.params.username)
        .fetch({require: true});

      ctx.status = 200;
    } catch (e) {
      ctx.status = 404;
    }
  };

  checkEmailTaken = async (ctx) => {
    let User = this.bookshelf.model('User');

    try {
      await User
        .forge()
        .where('email', ctx.params.email)
        .fetch({require: true});

      ctx.status = 200;
    } catch (e) {
      ctx.status = 404;
    }
  };

  getAvailableUsername = async (ctx) => {
    let User = this.bookshelf.model('User');

    async function checkUserExists(username) {
      let user = await User
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

      ctx.body = {username};
    } catch (e) {
      ctx.status = 404;
      ctx.body = {error: e.message};
    }
  };

  registerUser = async (ctx) => {
    let optionalFields = ['firstName', 'lastName'];

    let checkit = new Checkit(UserValidators.registration);
    try {
      await checkit.run(ctx.request.body);
    } catch (e) {
      ctx.status = 400;
      ctx.body = {error: e.toJSON()};
      return;
    }

    const User = this.bookshelf.model('User');
    const username = ctx.request.body.username.toLowerCase();

    {
      const check = await User.where({ username }).fetch({require: false});
      if (check) {
        ctx.status = 409;
        ctx.body = {error: 'User with this username is already registered'};
        return;
      }
    }

    {
      let check = await User.where({email: ctx.request.body.email}).fetch({require: false});
      if (check) {
        ctx.status = 409;
        ctx.body = {error: 'User with this email is already registered'};
        return;
      }
    }

    let moreData = {};
    for (let fieldName of optionalFields) {
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
        ctx.body = {error: 'User already exists'};
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
      ctx.status = 500;
      ctx.body = {error: 'Internal Server Error'};
      console.error('Session engine is not available, have you started redis service?');  // eslint-disable-line no-console
      return;
    }

    let requiredFields = ['username', 'password'];

    for (let fieldName of requiredFields) {
      if (!(fieldName in ctx.request.body)) {
        ctx.status = 400;
        ctx.body = {error: 'Bad Request'};
        return;
      }
    }

    let User = this.bookshelf.model('User');
    const username = ctx.request.body.username.toLowerCase();

    let user;

    try {
      user = await new User({ username }).fetch({require: true});
    } catch (e) {
      console.warn(`Someone tried to log in as '${username}', but there's no such user`);  // eslint-disable-line no-console
      ctx.status = 401;
      ctx.body = {success: false};
      return
    }

    let passwordIsValid = await bcryptAsync.compareAsync(ctx.request.body.password, user.get('hashed_password'));

    if (!passwordIsValid) {
      console.warn(`Someone tried to log in as '${username}', but used wrong pasword`);  // eslint-disable-line no-console
      ctx.status = 401;
      ctx.body = {success: false};
      return
    }

    if (user.get('email_check_hash')) {
      console.warn(`user '${username}' has not validated email`); // eslint-disable-line no-console
      ctx.status = 401;
      ctx.body = {success: false, error: 'Please follow the instructions mailed to you during registration.'};
      return;
    }

    ctx.session.user = user.id;
    user = await User
      .where({id: ctx.session.user})
      .fetch({
        require: true,
        withRelated: [
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
        ]
      });

    ctx.body = { success: true, user };
  };

  verifyEmail = async (ctx) => {
    let User = this.bookshelf.model('User');

    let user;

    try {
      user = await new User({email_check_hash: ctx.params.hash}).fetch({require: true});
    } catch (e) {
      console.warn(`Someone tried to verify email, but used invalid hash`);  // eslint-disable-line no-console
      ctx.status = 401;
      ctx.body = {success: false};
      return;
    }

    user.set('email_check_hash', '');
    await user.save(null, {method: 'update'});

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
      ctx.body = {error: 'Please use profile change password feature.'};
      return;
    }

    for (let fieldName of ['email']) {
      if (!(fieldName in ctx.request.body)) {
        ctx.status = 400;
        ctx.body = {error: 'Bad Request'};
        return;
      }
    }

    let User = this.bookshelf.model('User');

    let user;

    try {
      user = await new User({email: ctx.request.body.email}).fetch({require: true});
    } catch (e) {
      // we do not show any error if we do not have user.
      // To prevent disclosure information about registered emails.
      ctx.status = 200;
      ctx.body = {success: true};
      return;
    }

    let random = Math.random().toString();
    let sha1 = crypto.createHash('sha1').update(user.email + random).digest('hex');

    if (!user.get('reset_password_hash')) {
      user.set('reset_password_hash', sha1);
      await user.save(null, {method: 'update'});
    }

    this.queue.createJob('reset-password-email', {
      username: user.get('username'),
      email: ctx.request.body.email,
      hash: user.get('reset_password_hash')
    });

    ctx.status = 200;
    ctx.body = {success: true};
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

    let User = this.bookshelf.model('User');

    let user;

    try {
      user = await new User({reset_password_hash: ctx.params.hash}).fetch({require: true});
    } catch (e) {
      console.warn(`Someone tried to reset password using unknown reset-hash`);  // eslint-disable-line no-console
      ctx.status = 401;
      ctx.body = {success: false};
      return;
    }

    if (!('password' in ctx.request.body) || !('password_repeat' in ctx.request.body)) {
      ctx.status = 400;
      ctx.body = {error: '"password" or "password_repeat" parameter is not provided'};
      return;
    }

    if (ctx.request.body.password !== ctx.request.body.password_repeat) {
      ctx.status = 400;
      ctx.body = {error: '"password" and "password_repeat" do not exact match.'};
      return;
    }

    let hashedPassword = await bcryptAsync.hashAsync(ctx.request.body.password, 10);

    user.set('hashed_password', hashedPassword);
    user.set('reset_password_hash', '');

    await user.save(null, {method: 'update'});
    ctx.body = {success: true};

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
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    const User = this.bookshelf.model('User');

    const user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['ignored_users', 'following']});

    const ignoredIds = user.related('ignored_users').pluck('id');
    const followingIds = user.related('following').pluck('id');

    const usersToIgnore = _.uniq(_.concat(ignoredIds, followingIds));

    const suggestions = await User
      .collection()
      .query(qb => {
        qb
          .select('active_users.*')
          .from(function(){
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
      .fetch({withRelated: ['following', 'followers', 'liked_posts', 'favourited_posts']});

    ctx.body = suggestions;
  };

  initialSuggestions = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let User = this.bookshelf.model('User');

    let q = User.forge()
      .query(qb => {
        qb
          .select('users.*')
          .count('posts.id as post_count')
          .from('users')
          .where('users.id', '!=', ctx.session.user)
          .leftJoin('posts', 'users.id', 'posts.user_id')
          .groupBy('users.id')
          .orderBy('post_count', 'desc')
          .limit(20)
      })

    let suggestions = await q.fetchAll({require: true, withRelated: ['following', 'followers', 'liked_posts', 'favourited_posts']});

    ctx.body = suggestions;
  };

  createPost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    if (!('type' in ctx.request.body)) {
      ctx.status = 400;
      ctx.body = {error: '"type" parameter is not given'};
      return;
    }

    let typeRequirements = {
      short_text: ['text'],
      long_text: ['title', 'text']
    };

    if (!(ctx.request.body.type in typeRequirements)) {
      ctx.status = 400;
      ctx.body = {error: `"${ctx.request.body.type}" type is not supported`};
      return;
    }

    let thisTypeRequirements = typeRequirements[ctx.request.body.type];

    for (let varName of thisTypeRequirements) {
      if (!(varName in ctx.request.body)) {
        ctx.status = 400;
        ctx.body = {error: `"${varName}" parameter is not given`};
        return;
      }
    }

    let hashtags;

    if ('hashtags' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.hashtags)) {
        ctx.status = 400;
        ctx.body = {error: `"hashtags" parameter is expected to be an array`};
        return;
      }

      if (ctx.request.body.hashtags.filter(tag => (countBreaks(tag) < 3)).length > 0) {
        ctx.status = 400;
        ctx.body = {error: `each of tags should be at least 3 characters wide`};
        return;
      }

      hashtags = _.uniq(ctx.request.body.hashtags);
    }

    let schools;

    if ('schools' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.schools)) {
        ctx.status = 400;
        ctx.body = {error: `"schools" parameter is expected to be an array`};
        return;
      }

      schools = _.uniq(ctx.request.body.schools);
    }

    let geotags;

    if ('geotags' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.geotags)) {
        ctx.status = 400;
        ctx.body = {error: `"geotags" parameter is expected to be an array`};
        return;
      }

      geotags = _.uniq(ctx.request.body.geotags);
    }

    let Post = this.bookshelf.model('Post');

    let obj = new Post({
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
      await obj.save(null, {method: 'insert'});

      if (_.isArray(hashtags)) {
        await obj.attachHashtags(hashtags);
      }

      if (_.isArray(schools)) {
        await obj.attachSchools(schools);
      }

      if (_.isArray(geotags)) {
        await obj.attachGeotags(geotags);
      }

      await obj.fetch({require: true, withRelated: POST_RELATIONS});
      obj.relations.schools = obj.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));

      ctx.body = obj.toJSON();
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  };

  updatePost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    if (!('id' in ctx.params)) {
      ctx.status = 400;
      ctx.body = {error: '"id" parameter is not given'};
      return;
    }

    let Post = this.bookshelf.model('Post');

    let post_object;

    try {
      post_object = await Post.where({ id: ctx.params.id, user_id: ctx.session.user }).fetch({require: true, withRelated: ['hashtags']});
    } catch(e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return
    }

    let type = post_object.get('type');

    let hashtags;

    if ('hashtags' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.hashtags)) {
        ctx.status = 400;
        ctx.body = {error: `"hashtags" parameter is expected to be an array`};
        return;
      }

      if (ctx.request.body.hashtags.filter(tag => (countBreaks(tag) < 3)).length > 0) {
        ctx.status = 400;
        ctx.body = {error: `each of tags should be at least 3 characters wide`};
        return;
      }

      hashtags = _.uniq(ctx.request.body.hashtags);
    }

    let schools;

    if ('schools' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.schools)) {
        ctx.status = 400;
        ctx.body = {error: `"schools" parameter is expected to be an array`};
        return;
      }

      schools = _.uniq(ctx.request.body.schools);
    }

    let geotags;

    if ('geotags' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.geotags)) {
        ctx.status = 400;
        ctx.body = {error: `"geotags" parameter is expected to be an array`};
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
        let more = post_object.get('more');
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
      await post_object.save(null, {method: 'update'});

      if (_.isArray(hashtags)) {
        await post_object.attachHashtags(hashtags, true);
      }

      if (_.isArray(schools)) {
        await post_object.updateSchools(schools, true);
      }

      if (_.isArray(geotags)) {
        await post_object.updateGeotags(geotags);
      }

      await post_object.fetch({require: true, withRelated: POST_RELATIONS});
      post_object.relations.schools = post_object.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));

      ctx.body = post_object.toJSON();
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  };

  removePost = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    if (!('id' in ctx.params)) {
      ctx.status = 400;
      ctx.body = {error: '"id" parameter is not given'};
      return;
    }

    let Post = this.bookshelf.model('Post');

    try {
      let post_object = await Post.where({ id: ctx.params.id }).fetch({require: true});

      if (post_object.get('user_id') != ctx.session.user) {
        ctx.status = 403;
        ctx.body = {error: 'You are not authorized'};
        return;
      }

      post_object.destroy();
    } catch(e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
    ctx.status = 200;
    ctx.body = {success: true};
  };

  getUser = async (ctx) => {
    let User = this.bookshelf.model('User');
    let u = await User
      .where({username: ctx.params.username})
      .fetch({
        require: true,
        withRelated: [
          'following', 'followers', 'liked_posts',
          'liked_hashtags', 'liked_schools', 'liked_geotags',
          'favourited_posts', 'followed_hashtags',
          'followed_schools', 'followed_geotags'
        ]
      });

    ctx.body = u.toJSON();
  };

  followUser = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let User = this.bookshelf.model('User');
    let follow_status = { success: false };

    try {
      let user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['following', 'followers']});
      let follow = await User.where({username: ctx.params.username}).fetch({require: true, withRelated: ['following', 'followers']});

      if (user.id != follow.id && _.isUndefined(user.related('following').find({id: follow.id}))) {
        await user.following().attach(follow);

        follow_status.success = true;
        user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['following', 'followers']});
        follow = await User.where({username: ctx.params.username}).fetch({require: true, withRelated: ['following', 'followers']});
      }

      follow_status.user1 = user.toJSON();
      follow_status.user2 = follow.toJSON();
    } catch(ex) {
      ctx.status = 500;
      follow_status.error = ex.message;
    }

    ctx.body = follow_status;
  };

  ignoreUser = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let User = this.bookshelf.model('User');

    let user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['ignored_users']});
    let userToIgnore = await User.where({username: ctx.params.username}).fetch({require: true});

    await user.ignoreUser(userToIgnore.id);

    ctx.body = {success: true};
  };

  updateUser = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let checkit = new Checkit(UserValidators.settings.more);
    try {
      await checkit.run(ctx.request.body.more);
    } catch (e) {
      ctx.status = 400;
      ctx.body = {error: e.toJSON()};
      return;
    }

    let User = this.bookshelf.model('User');

    try {
      let user = await User.where({id: ctx.session.user}).fetch({require: true});

      let properties = {};

      for (let fieldName in UserValidators.settings.more) {
        if (fieldName in ctx.request.body.more) {
          properties[fieldName] = ctx.request.body.more[fieldName];
        }
      }

      properties = _.extend(user.get('more'), properties);
      user.set('more', properties);

      await user.save(null, {method: 'update'});

      ctx.body = {user};
    } catch(e) {
      ctx.status = 500;
      ctx.body = {error: 'Update failed'};
      return;
    }
  };

  changePassword = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    if (!('old_password' in ctx.request.body) || !('new_password' in ctx.request.body)) {
      ctx.status = 400;
      ctx.body = {error: '"old_password" or "new_password" parameter is not provided'};
      return;
    }

    let User = this.bookshelf.model('User');

    try {
      let user = await User.where({id: ctx.session.user}).fetch({require: true});

      let passwordIsValid = await bcryptAsync.compareAsync(ctx.request.body.old_password, user.get('hashed_password'));

      if (!passwordIsValid) {
        ctx.status = 401;
        ctx.body = {error: 'old password is incorrect'};
        return
      }

      let hashedPassword = await bcryptAsync.hashAsync(ctx.request.body.new_password, 10);

      user.set('hashed_password', hashedPassword);

      await user.save(null, {method: 'update'});

      ctx.body = {success: true};
    } catch(e) {
      ctx.status = 500;
      ctx.body = {error: 'Update failed'};
      return;
    }
  };

  unfollowUser = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let User = this.bookshelf.model('User');
    let follow_status = { success: false };

    try {
      let user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['following', 'followers']});
      let follow = await User.where({username: ctx.params.username}).fetch({require: true, withRelated: ['following', 'followers']});

      if (user.id != follow.id && !_.isUndefined(user.related('following').find({id: follow.id}))) {
        await user.following().detach(follow);

        follow_status.success = true;
        user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['following', 'followers']});
        follow = await User.where({username: ctx.params.username}).fetch({require: true, withRelated: ['following', 'followers']});
      }

      follow_status.user1 = user.toJSON();
      follow_status.user2 = follow.toJSON();
    } catch(ex) {
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
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    if (!ctx.files || !ctx.files.length) {
      ctx.status = 400;
      ctx.body = {error: '"files" parameter is not provided'};
      return;
    }

    let Attachment = this.bookshelf.model('Attachment');

    try {
      let promises = ctx.files.map(file => {
        return Attachment.create(
          file.originalname,
          file.buffer,
          {user_id: ctx.session.user}
        );
      });

      let attachments = await Promise.all(promises);

      ctx.body = {success: true, attachments};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: `Upload failed: ${e.stack}`};
      return;
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
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    if (!ctx.request.body.original_id) {
      ctx.status = 400;
      ctx.body = {error: '"original_id" parameter is not provided'};
      return;
    }

    if (!ctx.request.body.transforms) {
      ctx.status = 400;
      ctx.body = {error: '"transforms" parameter is not provided'};
      return;
    }

    let Attachment = this.bookshelf.model('Attachment');

    try {
      let result;
      let transforms = JSON.parse(ctx.request.body.transforms);

      // Get the original attachment, checking ownership.
      let original = await Attachment
        .forge()
        .query(qb => {
          qb
            .where('id', ctx.request.body.original_id)
            .andWhere('user_id', ctx.session.user);
        })
        .fetch({require: true});

      // Check if the format of the attachment is supported.
      let { supportedImageFormats } = config.attachments;
      if (supportedImageFormats.indexOf(original.attributes.mime_type) < 0) {
        ctx.status = 400;
        ctx.body = {error: 'Image type is not supported'};
        return;
      }

      // Download the original attachment data from s3.
      let originalData = await original.download();

      // Process the data.
      let newImage = await processImage(originalData.Body, transforms);
      let imageBuffer = await newImage.toBufferAsync(original.extension());

      // Update the attachment specified in derived_id or create a new one.
      if (ctx.request.body.derived_id) {
        let oldAttachment = await Attachment
          .forge()
          .query(qb => {
            qb
              .where('id', ctx.request.body.derived_id)
              .andWhere('user_id', ctx.session.user);
          })
          .fetch({require: true});

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

      ctx.body = {success: true, attachment: result};
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
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    try {
      let response = await request
        .get(`https://pickpoint.io/api/v1/forward`)
        .query(Object.assign(ctx.query, {key: config.pickpoint.key}));

      // pickpoint answers with wrong content-type, so we do decoding manually
      let responseText = response.text;
      let data = JSON.parse(responseText);

      ctx.body = data;
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  };

  /**
   * Returns 50 most popular hashtags sorted by post count.
   * Each hashtag in response contains post_count.
   */
  getTagCloud = async (ctx) => {
    let Hashtag = this.bookshelf.model('Hashtag');

    try {
      let hashtags = await Hashtag
        .collection()
        .query(qb => {
          qb
            .select('hashtags.*')
            .count('hashtags_posts.* as post_count')
            .join('hashtags_posts', 'hashtags.id', 'hashtags_posts.hashtag_id')
            .groupBy('hashtags.id')
            .orderBy('post_count', 'DESC');
        })
        .fetch({require: true});

      ctx.body = hashtags;
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  };

  getSchoolCloud = async (ctx) => {
    let School = this.bookshelf.model('School');

    try {
      let schools = await School
        .collection()
        .query(qb => {
          qb
            .select('schools.*')
            .count('posts_schools.* as post_count')
            .join('posts_schools', 'schools.id', 'posts_schools.school_id')
            .groupBy('schools.id')
            .orderBy('post_count', 'DESC')
            .limit(50);
        })
        .fetch({require: true});

      ctx.body = schools;
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
    }
  };

  getGeotagCloud = async (ctx) => {
    const Geotag = this.bookshelf.model('Geotag');

    const geotags = await Geotag
      .collection()
      .query(qb => {
        qb
          .select('geotags.*')
          .count('geotags_posts.* as post_count')
          .join('geotags_posts', 'geotags.id', 'geotags_posts.geotag_id')
          .groupBy('geotags.id')
          .orderBy('post_count', 'DESC')
          .limit(50);
      })
      .fetch({require: true});

    ctx.body = geotags;
  };

  getUserRecentHashtags = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let Hashtag = this.bookshelf.model('Hashtag');

    let hashtags = await Hashtag
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
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let School = this.bookshelf.model('School');

    let schools = await School
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
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let Geotag = this.bookshelf.model('Geotag');

    let geotags = await Geotag
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
    let User = this.bookshelf.model('User');
    let Hashtag = this.bookshelf.model('Hashtag');

    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    if (!ctx.params.name) {
      ctx.status = 400;
      ctx.body = {error: '"name" parameter is not given'};
      return;
    }

    try {
      let currentUser = await User.forge().where('id', ctx.session.user).fetch();
      let hashtag = await Hashtag.forge().where('name', ctx.params.name).fetch();

      await currentUser.followHashtag(hashtag.id);

      ctx.body = {success: true, hashtag};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  };

  unfollowTag = async (ctx) => {
    let User = this.bookshelf.model('User');
    let Hashtag = this.bookshelf.model('Hashtag');

    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    if (!ctx.params.name) {
      ctx.status = 400;
      ctx.body = {error: '"name" parameter is not given'};
      return;
    }

    try {
      let currentUser = await User.forge().where('id', ctx.session.user).fetch();
      let hashtag = await Hashtag.forge().where('name', ctx.params.name).fetch();

      await currentUser.unfollowHashtag(hashtag.id);

      ctx.body = {success: true, hashtag};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  };

  followSchool = async (ctx) => {
    let User = this.bookshelf.model('User');
    let School = this.bookshelf.model('School');

    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    if (!ctx.params.name) {
      ctx.status = 400;
      ctx.body = {error: '"name" parameter is not given'};
      return;
    }

    try {
      let currentUser = await User.forge().where('id', ctx.session.user).fetch();
      let school = await School.forge().where('url_name', ctx.params.name).fetch({require: true});

      await currentUser.followSchool(school.id);

      ctx.body = {success: true, school};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  };

  unfollowSchool = async (ctx) => {
    let User = this.bookshelf.model('User');
    let School = this.bookshelf.model('School');

    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    if (!ctx.params.name) {
      ctx.status = 400;
      ctx.body = {error: '"name" parameter is not given'};
      return;
    }

    try {
      let currentUser = await User.forge().where('id', ctx.session.user).fetch();
      let school = await School.forge().where('url_name', ctx.params.name).fetch({require: true});

      await currentUser.unfollowSchool(school.id);

      ctx.body = {success: true, school};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  };

  followGeotag = async (ctx) =>  {
    let User = this.bookshelf.model('User');
    let Geotag = this.bookshelf.model('Geotag');

    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    if (!ctx.params.url_name) {
      ctx.status = 400;
      ctx.body = {error: '"url_name" parameter is not given'};
      return;
    }

    try {
      let currentUser = await User.forge().where('id', ctx.session.user).fetch();
      let geotag = await Geotag.forge().where('url_name', ctx.params.url_name).fetch();

      await currentUser.followGeotag(geotag.id);

      ctx.body = {success: true, geotag};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  };

  unfollowGeotag = async (ctx) => {
    let User = this.bookshelf.model('User');
    let Geotag = this.bookshelf.model('Geotag');

    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    if (!ctx.params.url_name) {
      ctx.status = 400;
      ctx.body = {error: '"url_name" parameter is not given'};
      return;
    }

    try {
      let currentUser = await User.forge().where('id', ctx.session.user).fetch();
      let geotag = await Geotag.forge().where('url_name', ctx.params.url_name).fetch();

      await currentUser.unfollowGeotag(geotag.id);

      ctx.body = {success: true, geotag};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  };

  checkGeotagExists = async (ctx) => {
    let Geotag = this.bookshelf.model('Geotag');

    try {
      await Geotag.where('name', ctx.params.name).fetch({require: true});

      ctx.status = 200;
    } catch (e) {
      ctx.status = 404;
    }
  };

  getGeotag = async (ctx) => {
    let Geotag = this.bookshelf.model('Geotag');

    if (!ctx.params.url_name) {
      ctx.status = 400;
      ctx.body = {error: '"url_name" parameter is not given'};
      return;
    }

    try {
      let geotag = await Geotag
        .forge()
        .where('url_name', ctx.params.url_name)
        .fetch({require: true, withRelated: ['country', 'admin1', 'city', 'continent', 'geonames_city']});

      ctx.body = geotag;
    } catch (e) {
      ctx.status = 404;
      ctx.body = {error: e.message};
    }
  };

  getHashtag = async (ctx) => {
    let Hashtag = this.bookshelf.model('Hashtag');

    if (!ctx.params.name) {
      ctx.status = 400;
      ctx.body = {error: '"name" parameter is not given'};
      return;
    }

    try {
      let hashtag = await Hashtag
        .forge()
        .where('name', ctx.params.name)
        .fetch({require: true});

      ctx.body = hashtag;
    } catch (e) {
      ctx.status = 404;
      ctx.body = {error: e.message};
    }
  };

  searchGeotags = async (ctx) => {
    let Geotag = this.bookshelf.model('Geotag');

    try {
      let geotags = await Geotag.collection().query(function (qb) {
        qb
          .where('name', 'ILIKE',  `${ctx.params.query}%`)
          .limit(10);
      }).fetch({withRelated: ['country', 'admin1']});

      ctx.body = {geotags};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  };

  searchTags = async (ctx) => {
    let Hashtag = this.bookshelf.model('Hashtag');

    try {
      let hashtags = await Hashtag.collection().query(function (qb) {
        qb
          .where('name', 'ILIKE', `${ctx.params.query}%`)
          .limit(10);
      }).fetch();

      ctx.body = {hashtags};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
    }
  };

  /**
   * Gets 3 related posts ordered by a number of matching tags + a random number between 0 and 3.
   */
  getRelatedPosts = async (ctx) => {
    function formatArray(array) {
      return `(${array.map(function (e) { return "'" + e + "'"; }).join(',')})`
    }

    let knex = this.bookshelf.knex;
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post
        .forge()
        .where('id', ctx.params.id)
        .fetch({withRelated: ['hashtags', 'geotags', 'schools']});

      let hashtagIds = post.related('hashtags').pluck('id');
      let schoolIds = post.related('schools').pluck('id');
      let geotagIds = post.related('geotags').pluck('id');

      // I've tried `leftJoinRaw`, and `on(knex.raw())`.
      // Both trow `syntax error at or near "$1"`.
      let posts = await Post.collection().query(qb => {
        let countQueries = [];

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
      }).fetch({withRelated: POST_RELATIONS});
      let post_comments_count = await this.countComments(posts);
      posts = posts.map(post => {
        post.attributes.comments = post_comments_count[post.get('id')];
        return post;
      });
      ctx.body = posts;
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
    }
  };

  likeHashtag = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let User = this.bookshelf.model('User');
    let Hashtag = this.bookshelf.model('Hashtag');
    let Post = this.bookshelf.model('Post');

    try {
      let user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['liked_hashtags']});
      let hashtag = await Hashtag.where({name: ctx.params.name}).fetch({require: true});

      await user.liked_hashtags().detach(hashtag);
      await user.liked_hashtags().attach(hashtag);

      await new Post({
        id: uuid.v4(),
        type: 'hashtag_like',
        liked_hashtag_id: hashtag.id,
        user_id: user.id
      }).save(null, {method: 'insert'});

      ctx.body = {success: true, hashtag};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: `Couldn't like the tag: ${e.message}`};
    }
  };

  unlikeHashtag = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let User = this.bookshelf.model('User');
    let Hashtag = this.bookshelf.model('Hashtag');
    let Post = this.bookshelf.model('Post');

    try {
      let user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['liked_hashtags']});
      let hashtag = await Hashtag.where({name: ctx.params.name}).fetch({require: true});

      await user.liked_hashtags().detach(hashtag);

      await Post
        .where({
          user_id: user.id,
          liked_hashtag_id: hashtag.id
        })
        .destroy();

      ctx.body = {success: true, hashtag};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: `Couldn't unlike the tag: ${e.message}`};
    }
  };

  likeSchool = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let User = this.bookshelf.model('User');
    let School = this.bookshelf.model('School');
    let Post = this.bookshelf.model('Post');

    try {
      let user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['liked_hashtags']});
      let school = await School.where({url_name: ctx.params.url_name}).fetch({require: true});

      await user.liked_schools().detach(school);
      await user.liked_schools().attach(school);

      await new Post({
        id: uuid.v4(),
        type: 'school_like',
        liked_school_id: school.id,
        user_id: user.id
      }).save(null, {method: 'insert'});

      ctx.body = {success: true, school};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: `Couldn't like the school: ${e.message}`};
    }
  };

  unlikeSchool = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let User = this.bookshelf.model('User');
    let School = this.bookshelf.model('School');
    let Post = this.bookshelf.model('Post');

    try {
      let user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['liked_hashtags']});
      let school = await School.where({url_name: ctx.params.url_name}).fetch({require: true});

      await user.liked_schools().detach(school);

      await Post
        .where({
          user_id: user.id,
          liked_school_id: school.id
        })
        .destroy();

      ctx.body = {success: true, school};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: `Couldn't unlike the school: ${e.message}`};
    }
  };

  likeGeotag = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let User = this.bookshelf.model('User');
    let Geotag = this.bookshelf.model('Geotag');
    let Post = this.bookshelf.model('Post');

    try {
      let user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['liked_hashtags']});
      let geotag = await Geotag.where({url_name: ctx.params.url_name}).fetch({require: true});

      await user.liked_geotags().detach(geotag);
      await user.liked_geotags().attach(geotag);

      await new Post({
        id: uuid.v4(),
        type: 'geotag_like',
        liked_geotag_id: geotag.id,
        user_id: user.id
      }).save(null, {method: 'insert'});

      ctx.body = {success: true, geotag};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: `Couldn't like the geotag: ${e.message}`};
    }
  };

  unlikeGeotag = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let User = this.bookshelf.model('User');
    let Geotag = this.bookshelf.model('Geotag');
    let Post = this.bookshelf.model('Post');

    try {
      let user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['liked_hashtags']});
      let geotag = await Geotag.where({url_name: ctx.params.url_name}).fetch({require: true});

      await user.liked_geotags().detach(geotag);

      await Post
        .where({
          user_id: user.id,
          liked_geotag_id: geotag.id
        })
        .destroy();

      ctx.body = {success: true, geotag};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: `Couldn't unlike the geotag: ${e.message}`};
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
    let Comment = this.bookshelf.model('Comment');
    let q = Comment.forge()
      .query(qb => {
        qb
          .where('post_id', '=', ctx.params.id)
          .orderBy('created_at', 'asc')
      });

    let comments = await q.fetchAll({require: false, withRelated: ['user']});

    ctx.body = comments;
  };

  postComment = async (ctx) => {
    let Comment = this.bookshelf.model('Comment');
    let Post = this.bookshelf.model('Post');

    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let post_object;

    try {
      post_object = await Post.where({id: ctx.params.id}).fetch({require: true});
    } catch (e) {
      ctx.status = 404;
      return;
    }

    if(!('text' in ctx.request.body)) {
      ctx.status = 400;
      ctx.body = {error: 'Comment text cannot be empty'};
      return;
    }

    let comment_text = ctx.request.body.text.trim();

    let comment_object = new Comment({
      id: uuid.v4(),
      post_id: ctx.params.id,
      user_id: ctx.session.user,
      text: comment_text
    });

    post_object.attributes.updated_at = new Date().toJSON();

    try {
      await comment_object.save(null, {method: 'insert'});
      await post_object.save(null, {method: 'update'});

      this.queue.createJob('on-comment', {commentId: comment_object.id});

      await this.getPostComments(ctx);
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
    }
  };

  editComment = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let Post = this.bookshelf.model('Post');
    let Comment = this.bookshelf.model('Comment');

    let post_object;
    let comment_object;

    try {
      post_object = await Post.where({id: ctx.params.id}).fetch({require: true});
      comment_object = await Comment.where({
        id: ctx.params.comment_id,
        post_id: ctx.params.id
      }).fetch({require: true});
    } catch(e) {
      ctx.status = 404;
      ctx.body = {error: e.message};
      return
    }

    if(comment_object.get('user_id') != ctx.session.user)  {
      ctx.status = 403;
    }

    let comment_text;

    if(!('text' in ctx.request.body) || ctx.request.body.text.trim().length === 0) {
      ctx.status = 400;
      ctx.body = {error: 'Comment text cannot be empty'};
      return;
    }

    comment_text = ctx.request.body.text.trim();

    comment_object.set('text', comment_text);
    comment_object.set('updated_at', new Date().toJSON());
    post_object.attributes.updated_at = new Date().toJSON();

    await comment_object.save(null, {method: 'update'});
    await post_object.save(null, {method: 'update'});
    await this.getPostComments(ctx);
  };

  removeComment = async (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    if (!('id' in ctx.params) || !('comment_id' in ctx.params)) {
      ctx.status = 400;
      ctx.body = {error: '"id" parameter is not given'};
      return;
    }

    let Post = this.bookshelf.model('Post');
    let Comment = this.bookshelf.model('Comment');

    let post_object;
    try {
      post_object = await Post.where({id: ctx.params.id}).fetch({require: true});
      let comment_object = await Comment.where({ id: ctx.params.comment_id, post_id: ctx.params.id }).fetch({require: true});

      if (comment_object.get('user_id') != ctx.session.user) {
        ctx.status = 403;
        ctx.body = {error: 'You are not authorized'};
        return;
      }

      await comment_object.destroy();
    } catch(e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }

    post_object.attributes.updated_at = new Date().toJSON();

    await post_object.save(null, {method: 'update'});
    await this.getPostComments(ctx);
  };

  countComments = async (posts) => {
    let ids = posts.map(post => {
      return post.get('id');
    });

    if(ids.length < 1) {
      return {};
    }
    let Comment = this.bookshelf.model('Comment');
    let q = Comment.forge()
        .query(qb => {
          qb
              .select('post_id')
              .count('id as comment_count')
              .where('post_id', 'IN', ids)
              .groupBy('post_id');
        });

    let raw_counts = await q.fetchAll();

    let mapped_counts = _.mapValues(_.keyBy(raw_counts.toJSON(), 'post_id'), (item => {
      return parseInt(item.comment_count);
    }));

    let missing = _.difference(ids, _.keys(mapped_counts));

    let zeroes = _.fill(_.clone(missing), 0, 0, missing.length);
    return _.merge(_.zipObject(missing, zeroes), mapped_counts)
  };
}
