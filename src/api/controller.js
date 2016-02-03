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
import request from 'superagent';
import crypto from 'crypto'
import { createJob } from '../utils/queue';

import { processImage } from '../utils/image';
import config from '../../config';


let bcryptAsync = bb.promisifyAll(bcrypt);

export default class ApiController {
  constructor (bookshelf) {
    this.bookshelf = bookshelf;
  }

  async test(ctx) {
    ctx.body = {hello: 'world'};
  }

  async allPosts(ctx) {
    let Posts = this.bookshelf.collection('Posts');
    let posts = new Posts();
    let response = await posts.fetch({require: false, withRelated: ['user', 'likers', 'favourers', 'labels', 'schools', 'geotags']});
    response = response.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      return post;
    });

    ctx.body = response;
  }

  async userPosts(ctx) {
    let Post = this.bookshelf.model('Post');

    let q = Post.forge()
      .query(qb => {
        qb
          .join('users', 'users.id', 'posts.user_id')
          .where('users.username', '=', ctx.params.user)
          .orderBy('posts.created_at', 'desc')
      });

    let posts = await q.fetchAll({require: false, withRelated: ['user', 'likers', 'favourers', 'labels', 'schools', 'geotags']});
    posts = posts.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      return post;
    });

    ctx.body = posts;
  }

  async tagPosts(ctx) {
    let Post = this.bookshelf.model('Post');

    let q = Post.forge()
      .query(qb => {
        qb
          .join('labels_posts', 'posts.id', 'labels_posts.post_id')
          .join('labels', 'labels_posts.label_id', 'labels.id')
          .where('labels.name', '=', ctx.params.tag)
          .orderBy('posts.created_at', 'desc')
      });

    let posts = await q.fetchAll({require: false, withRelated: ['user', 'likers', 'favourers', 'labels', 'schools', 'geotags']});
    posts = posts.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      return post;
    });

    ctx.body = posts;
  }

  async schoolPosts(ctx) {
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

    let posts = await q.fetch({withRelated: ['user', 'likers', 'favourers', 'labels', 'schools', 'geotags']});
    posts = posts.serialize();
    posts.forEach(post => {
      post.schools = post.schools.map(school => _.pick(school, 'id', 'name', 'url_name'));
    });

    ctx.body = posts;
  }

  async geotagPosts(ctx) {
    let Post = this.bookshelf.model('Post');

    let q = Post.forge()
      .query(qb => {
        qb
          .join('geotags_posts', 'posts.id', 'geotags_posts.post_id')
          .join('geotags', 'geotags_posts.geotag_id', 'geotags.id')
          .where('geotags.url_name', ctx.params.url_name)
          .orderBy('posts.created_at', 'desc')
      });

    let posts = await q.fetchAll({withRelated: ['user', 'likers', 'favourers', 'labels', 'schools', 'geotags']});
    posts = posts.serialize();
    posts.forEach(post => {
      post.schools = post.schools.map(school => _.pick(school, 'id', 'name', 'url_name'));
    });

    ctx.body = posts;
  }


  async userTags(ctx){
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403
      ctx.body = {error: 'You are not authorized'}
      return;
    }
    let Post = this.bookshelf.model('Post');

    let q = Post.forge()
      .query(qb => {
        qb
          .where({user_id: ctx.session.user})
          .orderBy('posts.created_at', 'desc')
      });

    let posts = await q.fetchAll({require: false, withRelated: ['labels']})

    let label_lists = posts
      .map(row => row.relations.labels.toJSON())
      .filter(labels => labels.length > 0);

    let labels = _.uniq(_.flatten(label_lists), 'id')

    ctx.body = labels;
  }

  async getPost(ctx) {
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: ctx.params.id}).fetch({require: true, withRelated: ['user', 'likers', 'favourers', 'labels', 'schools', 'geotags']});
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      ctx.body = post.toJSON();
    } catch (e) {
      ctx.throw(404);
      return;
    }
  }

  async userLikedPosts(ctx) {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403
      ctx.body = {error: 'You are not authorized'}
      return;
    }
    let Post = this.bookshelf.model('Post');

    try {
      let likes = await this.bookshelf.knex
        .select('post_id')
        .from('likes')
        .where({user_id: ctx.session.user})
        .map(row => row.post_id);

      let q = Post.forge()
      .query(qb => {
        qb
          .whereIn('id', likes)
          .orderBy('posts.created_at', 'desc')
      });

      let posts = await q.fetchAll({require: false, withRelated: ['user', 'likers', 'favourers', 'labels', 'geotags']});

      ctx.body = posts;
    } catch (ex) {
      ctx.status = 500;
      ctx.body = ex.message;
      return;
    }
  }

  async getLikedPosts(ctx) {
    let Post = this.bookshelf.model('Post');

    try {
      let user_id = await this.bookshelf.knex
        .select('id')
        .from('users')
        .where('users.username', '=', ctx.params.user)
        .map(row => row.id);

      let likes = await this.bookshelf.knex
        .select('post_id')
        .from('likes')
        .where({user_id: user_id[0]})
        .map(row => row.post_id);

      let q = Post.forge()
      .query(qb => {
        qb
          .whereIn('id', likes)
          .orderBy('posts.created_at', 'desc')
      });

      let posts = await q.fetchAll({require: false, withRelated: ['user', 'likers', 'favourers', 'labels', 'schools', 'geotags']});

      ctx.body = posts;
    } catch (ex) {
      ctx.status = 500;
      ctx.body = ex.message;
      return;
    }
  }

  async userFavouredPosts(ctx) {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403
      ctx.body = {error: 'You are not authorized'}
      return;
    }
    let Post = this.bookshelf.model('Post');

    try {
      let favourites = await this.bookshelf.knex
        .select('post_id')
        .from('favourites')
        .where({user_id: ctx.session.user})
        .map(row => row.post_id);

      let q = Post.forge()
      .query(qb => {
        qb
          .whereIn('id', favourites)
          .orderBy('posts.created_at', 'desc')
      });

      let posts = await q.fetchAll({require: false, withRelated: ['user', 'likers', 'favourers', 'labels', 'geotags']});

      ctx.body = posts;
    } catch (ex) {
      ctx.status = 500;
      ctx.body = ex.message;
      return;
    }
  }

  async getFavouredPosts(ctx) {
    let Post = this.bookshelf.model('Post');

    try {
      let user_id = await this.bookshelf.knex
        .select('id')
        .from('users')
        .where('users.username', '=', ctx.params.user)
        .map(row => row.id);

      let favourites = await this.bookshelf.knex
        .select('post_id')
        .from('favourites')
        .where({user_id: user_id[0]})
        .map(row => row.post_id);

      let q = Post.forge()
      .query(qb => {
        qb
          .whereIn('id', favourites)
          .orderBy('posts.created_at', 'desc')
      });

      let posts = await q.fetchAll({require: false, withRelated: ['user', 'likers', 'favourers', 'labels', 'geotags']});

      ctx.body = posts;
    } catch (ex) {
      ctx.status = 500;
      ctx.body = ex.message;
      return;
    }
  }

  async getSchool(ctx) {
    let School = this.bookshelf.model('School');

    try {
      let school = await School
        .where({url_name: ctx.params.url_name})
        .fetch({require: true, withRelated: 'images'});

      ctx.body = school.toJSON();
    } catch (e) {
      ctx.throw(404)
      return;
    }
  }

  async getSchools(ctx) {
    let School = this.bookshelf.model('School');

    try {
      let schools = await School.fetchAll({withRelated: 'images'});
      ctx.body = schools.toJSON();
    } catch (e) {
      ctx.throw(404);
      return;
    }
  }

  async getCountries(ctx) {
    let Country = this.bookshelf.model('Country');

    try {
      let countries = await Country.fetchAll();
      ctx.body = countries.toJSON();
    } catch (e) {
      ctx.throw(404)
      return;
    }
  }

  async getCountry(ctx) {
    let Country = this.bookshelf.model('Country');

    try {
      let country = await Country.where({iso_alpha2: ctx.params.code}).fetch();
      ctx.body = country.toJSON();
    } catch (e) {
      ctx.throw(404)
      return;
    }
  }

  async getCity(ctx) {
    let City = this.bookshelf.model('City');

    try {
      let city = await City.where({id: ctx.params.id}).fetch();
      ctx.body = city.toJSON();
    } catch (e) {
      ctx.throw(404)
      return;
    }
  }

  async updateSchool(ctx) {
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

    let images;

    if (ctx.request.body.images) {
      if (!_.isArray(ctx.request.body.images)) {
        ctx.status = 400;
        ctx.body = {error: `"images" parameter is expected to be an array`};
        return;
      }

      images = _.unique(ctx.request.body.images);
    }

    let School = this.bookshelf.model('School');

    try {
      let school = await School.where({id: ctx.params.id}).fetch({require: true, withRelated: 'images'});
      let newAttributes = _.pick(ctx.body, 'name', 'description', 'more', 'lat', 'lon');

      if (_.isArray(images)) {
        school.updateImages(images);
      }

      school.set(newAttributes);
      await school.save();

      ctx.body = school;
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  }

  async likePost(ctx) {
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

      await user.liked_posts().attach(post);

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
  }

  async unlikePost(ctx) {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403
      ctx.body = {error: 'You are not authorized'}
      return;
    }

    let result = { success: false };

    let User = this.bookshelf.model('User');
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: ctx.params.id}).fetch({require: true});
      let user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['liked_posts']});

      await user.liked_posts().detach(post);

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
  }

  async favPost(ctx) {
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
  }

  async unfavPost(ctx) {
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
  }

  async subscriptions(ctx) {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let uid = ctx.session.user;
    let Post = this.bookshelf.model('Post');

    let q = Post.forge()
      .query(qb => {
        qb
          .distinct()
          .leftJoin('followers', 'followers.following_user_id', 'posts.user_id')
          .where('followers.user_id', '=', uid)  // followed posts
          .orWhere('posts.user_id', '=', uid)    // own posts
          .orderBy('posts.created_at', 'desc')
      })

    let posts = await q.fetchAll({require: false, withRelated: ['user', 'user.followers', 'likers', 'favourers', 'labels', 'schools', 'geotags']});
    posts = posts.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      return post;
    });

    ctx.body = posts;
  }

  async registerUser(ctx) {
    let requiredFields = ['username', 'password', 'email'];
    let optionalFields = ['firstName', 'lastName'];

    for (let fieldName of requiredFields) {
      if (!(fieldName in ctx.request.body)) {
        ctx.status = 400;
        ctx.body = {error: 'Bad Request'};
        return
      }
    }

    let User = this.bookshelf.model('User');

    {
      let check = await User.where({username: ctx.request.body.username}).fetch({require: false});
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
        moreData[fieldName] = ctx.body[fieldName];
      }
    }

    moreData.first_login = true;

    let user;

    try {
      user = await User.create(ctx.request.body.username, ctx.request.body.password, ctx.request.body.email, moreData);
    } catch (e) {
      if (e.code == 23505) {
        ctx.status = 401;
        ctx.body = {error: 'User already exists'};
        return;
      }

      throw e;
    }

    createJob('register-user-email', {
      username: user.get('username'),
      email: user.get('email'),
      hash: user.get('email_check_hash')
    });

    ctx.body = {success: true, user: user};
  }

  async login(ctx) {
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

    let user;

    try {
      user = await new User({username: ctx.request.body.username}).fetch({require: true});
    } catch (e) {
      console.warn(`Someone tried to log in as '${ctx.request.body.username}', but there's no such user`);  // eslint-disable-line no-console
      ctx.status = 401;
      ctx.body = {success: false};
      return
    }

    let passwordIsValid = await bcryptAsync.compareAsync(ctx.request.body.password, user.get('hashed_password'));

    if (!passwordIsValid) {
      console.warn(`Someone tried to log in as '${ctx.request.body.username}', but used wrong pasword`);  // eslint-disable-line no-console
      ctx.status = 401;
      ctx.body = {success: false};
      return
    }

    if (user.get('email_check_hash')) {
      console.warn(`user '${ctx.request.body.username}' has not validated email`); // eslint-disable-line no-console
      ctx.status = 401;
      ctx.body = {success: false, error: 'Please follow the instructions mailed to you during registration.'};
      return;
    }

    ctx.session.user = user.id;
    user = await User.where({id: ctx.session.user}).fetch({require: true, withRelated: ['following', 'followers', 'liked_posts', 'favourited_posts']});

    ctx.body = { success: true, user };
  }

  async verifyEmail(ctx) {
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

    createJob('verify-email', {
      username: user.get('username'),
      email: user.get('email')
    });

    ctx.redirect('/');
  }

  /**
   * Looks users record by submitted email, saves user random SHA1 hash.
   * If user is authorized. Show error message.
   *
   * If no user found send status 401.
   *
   * When user saved successfully, send message (publich event?) to user with
   * Reset password end-point url like: http://libertysoil/resetpasswordfrom?code={generatedcode}
   */
  async resetPassword(ctx) {

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

    createJob('reset-password-email', {
      username: user.get('username'),
      email: ctx.request.body.email,
      hash: user.get('reset_password_hash')
    });

    ctx.status = 200;
    ctx.body = {success: true};
  }

  /**
   * New password form action.
   * Validates new password form with password/password repeat values.
   * Saves new password to User model.
   */
  async newPassword(ctx) {

    if (ctx.session && ctx.session.user) {
      ctx.redirect('/');
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

  }

  async logout(ctx) {
    if (ctx.session && ctx.session.user) {
      ctx.session.destroy();
    }
    ctx.redirect('/');
  }

  async userSuggestions(ctx) {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let following = await this.bookshelf.knex
      .select('followers.following_user_id')
      .from('followers')
      .where('followers.user_id', '=', ctx.session.user)
      .map(row => row.following_user_id);

    let User = this.bookshelf.model('User');

    let q = User.forge()
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
          .leftJoin('followers', 'active_users.id', 'followers.following_user_id')
          .whereNull('followers.user_id')
          .orWhereNotIn('active_users.id', following)
          .orderBy('post_count', 'desc')
          .limit(6);
      });

    let suggestions = await q.fetchAll({withRelated: ['following', 'followers', 'liked_posts', 'favourited_posts']});

    ctx.body = suggestions;
  }

  async initialSuggestions(ctx) {
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
  }

  async createPost(ctx) {
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

    let tags;

    if ('tags' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.tags)) {
        ctx.status = 400;
        ctx.body = {error: `"tags" parameter is expected to be an array`};
        return;
      }

      if (ctx.request.body.tags.filter(tag => (countBreaks(tag) < 3)).length > 0) {
        ctx.status = 400;
        ctx.body = {error: `each of tags should be at least 3 characters wide`};
        return;
      }

      tags = _.unique(ctx.request.body.tags);
    }

    let schools;

    if ('schools' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.schools)) {
        ctx.status = 400;
        ctx.body = {error: `"schools" parameter is expected to be an array`};
        return;
      }

      schools = _.unique(ctx.request.body.schools);
    }

    let geotags;

    if ('geotags' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.geotags)) {
        ctx.status = 400;
        ctx.body = {error: `"geotags" parameter is expected to be an array`};
        return;
      }

      geotags = _.unique(ctx.request.body.geotags);
    }

    let Post = this.bookshelf.model('Post');

    let obj = new Post({
      id: uuid.v4(),
      type: ctx.request.body.type,
      user_id: ctx.session.user
    });

    if (ctx.request.body.type === 'short_text') {
      obj.set('text', ctx.request.body.text);
    } else if (ctx.request.body.type === 'long_text') {
      obj.set('text', ctx.request.body.text);
      obj.set('more', {title: ctx.request.body.title});
    }

    try {
      await obj.save(null, {method: 'insert'});

      if (_.isArray(tags)) {
        await obj.attachLabels(tags);
      }

      if (_.isArray(schools)) {
        await obj.attachSchools(schools);
      }

      if (_.isArray(geotags)) {
        await obj.attachGeotags(geotags);
      }

      await obj.fetch({require: true, withRelated: ['user', 'labels', 'likers', 'favourers', 'schools', 'geotags']});
      obj.relations.schools = obj.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));

      ctx.body = obj.toJSON();
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  }

  async updatePost(ctx) {
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
      post_object = await Post.where({ id: ctx.params.id, user_id: ctx.session.user }).fetch({require: true, withRelated: ['labels']});
    } catch(e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return
    }

    let type = post_object.get('type');

    let tags;

    if ('tags' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.tags)) {
        ctx.status = 400;
        ctx.body = {error: `"tags" parameter is expected to be an array`};
        return;
      }

      if (ctx.request.body.tags.filter(tag => (countBreaks(tag) < 3)).length > 0) {
        ctx.status = 400;
        ctx.body = {error: `each of tags should be at least 3 characters wide`};
        return;
      }

      tags = _.unique(ctx.request.body.tags);
    }

    let schools;

    if ('schools' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.schools)) {
        ctx.status = 400;
        ctx.body = {error: `"schools" parameter is expected to be an array`};
        return;
      }

      schools = _.unique(ctx.request.body.schools);
    }

    let geotags;

    if ('geotags' in ctx.request.body) {
      if (!_.isArray(ctx.request.body.geotags)) {
        ctx.status = 400;
        ctx.body = {error: `"geotags" parameter is expected to be an array`};
        return;
      }

      geotags = _.unique(ctx.request.body.geotags);
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

    try {
      await post_object.save(null, {method: 'update'});

      if (_.isArray(tags)) {
        await post_object.attachLabels(tags, true);
      }

      if (_.isArray(schools)) {
        await post_object.updateSchools(schools, true);
      }

      if (_.isArray(geotags)) {
        await post_object.updateGeotags(geotags);
      }

      await post_object.fetch({require: true, withRelated: ['user', 'labels', 'likers', 'favourers', 'schools', 'geotags']});
      post_object.relations.schools = post_object.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));

      ctx.body = post_object.toJSON();
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  }

  async removePost(ctx) {
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
      let post_object = await Post.where({ id: ctx.params.id, user_id: ctx.session.user }).fetch({require: true});
      post_object.destroy();
    } catch(e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
    ctx.status = 200;
    ctx.body = {success: true};
  }

  async getUser(ctx) {
    let User = this.bookshelf.model('User');
    let u = await User
      .where({username: ctx.params.username})
      .fetch({
        require: true,
        withRelated: [
          'following', 'followers', 'liked_posts',
          'favourited_posts', 'followed_labels',
          'followed_schools', 'followed_geotags'
        ]
      });

    ctx.body = u.toJSON();
  }

  async followUser(ctx) {
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
  }

  async updateUser(ctx) {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 403;
      ctx.body = {error: 'You are not authorized'};
      return;
    }

    let User = this.bookshelf.model('User');

    try {
      let user = await User.where({id: ctx.session.user}).fetch({require: true});

      if(!_.isEmpty(ctx.request.body.more)) {
        let properties = _.extend(user.get('more'), ctx.request.body.more);
        user.set('more', properties);
      }

      await user.save(null, {method: 'update'});

      ctx.body = {user};
    } catch(e) {
      ctx.status = 500;
      ctx.body = {error: 'Update failed'};
      return;
    }
  }

  async changePassword(ctx) {
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
  }

  async unfollowUser(ctx) {
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
  }

  /**
   * Creates attachments from 'files'.
   * Important: set the 'name' property of each file input to 'files', not 'files[]' or 'files[0]'
   */
  async uploadFiles(ctx) {
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
  }

  /**
   * Loads the image from s3, transforms it and creates a new attachment with the new image
   * if derived_id is not specified.
   * If derived_id is specified then updates the attachment and responds with it.
   * Body params:
   *   original_id (required) - Id of the original attachment.
   *   transforms (required) - Json array with transforms. See utils/image.js processImage
   *   derived_id - Id of the attachment to reuse
   */
  async processImage(ctx) {
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
      ctx.status = 500;
      ctx.body = {error: `Image transformation failed: ${e.message}`};
      return;
    }

  }

  async pickpoint(ctx) {
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
  }

  /**
   * Returns 50 most popular labels sorted by post count.
   * Each label in response contains post_count.
   */
  async getTagCloud(ctx) {
    let Label = this.bookshelf.model('Label');

    try {
      let labels = await Label
        .collection()
        .query(qb => {
          qb
            .select('labels.*')
            .count('labels_posts.* as post_count')
            .join('labels_posts', 'labels.id', 'labels_posts.label_id')
            .groupBy('labels.id')
            .orderBy('post_count', 'DESC')
            .limit(50);
        })
        .fetch({require: true});

      ctx.body = labels;
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  }

  async followTag(ctx) {
    let User = this.bookshelf.model('User');
    let Label = this.bookshelf.model('Label');

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
      let label = await Label.forge().where('name', ctx.params.name).fetch();

      await currentUser.followLabel(label.id);

      ctx.body = {success: true, tag: label};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  }

  async unfollowTag(ctx) {
    let User = this.bookshelf.model('User');
    let Label = this.bookshelf.model('Label');

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
      let label = await Label.forge().where('name', ctx.params.name).fetch();

      await currentUser.unfollowLabel(label.id);

      ctx.body = {success: true, tag: label};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  }

  async followSchool(ctx) {
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
  }

  async unfollowSchool(ctx) {
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
  }

  async followGeotag(ctx) {
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
  }

  async unfollowGeotag(ctx) {
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
  }

  async getGeotag(ctx) {
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
        .fetch({require: true, withRelated: ['country', 'city']});

      ctx.body = geotag;
    } catch (e) {
      ctx.throw(404);
      return;
    }
  }

  async searchGeotags(ctx) {
    let Geotag = this.bookshelf.model('Geotag');

    try {
      let geotags = await Geotag.collection().query(function (qb) {
        qb
          .where('name', 'ILIKE',  `${ctx.params.query}%`)
          .limit(10);
      }).fetch(/*{withRelated: 'place'}*/);

      ctx.body = {geotags};
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  }
}
