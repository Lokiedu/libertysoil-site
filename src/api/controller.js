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

  async test(req, res) {
    res.send({hello: 'world'});
  }

  async allPosts(req, res) {
    let Posts = this.bookshelf.collection('Posts');
    let posts = new Posts();
    let response = await posts.fetch({require: false, withRelated: ['user', 'likers', 'favourers', 'labels', 'schools', 'geotags']});
    response = response.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      return post;
    });

    res.send(response);
  }

  async userPosts(req, res) {
    let Post = this.bookshelf.model('Post');

    let q = Post.forge()
      .query(qb => {
        qb
          .join('users', 'users.id', 'posts.user_id')
          .where('users.username', '=', req.params.user)
          .orderBy('posts.created_at', 'desc')
      });

    let posts = await q.fetchAll({require: false, withRelated: ['user', 'likers', 'favourers', 'labels', 'schools', 'geotags']});
    posts = posts.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      return post;
    });

    res.send(posts);
  }

  async tagPosts(req, res) {
    let Post = this.bookshelf.model('Post');

    let q = Post.forge()
      .query(qb => {
        qb
          .join('labels_posts', 'posts.id', 'labels_posts.post_id')
          .join('labels', 'labels_posts.label_id', 'labels.id')
          .where('labels.name', '=', req.params.tag)
          .orderBy('posts.created_at', 'desc')
      });

    let posts = await q.fetchAll({require: false, withRelated: ['user', 'likers', 'favourers', 'labels', 'schools', 'geotags']});
    posts = posts.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      return post;
    });

    res.send(posts);
  }

  async schoolPosts(req, res) {
    let Post = this.bookshelf.model('Post');

    let q = Post.collection()
      .query(qb => {
        qb
          .join('posts_schools', 'posts.id', 'posts_schools.post_id')
          .join('schools', 'posts_schools.school_id', 'schools.id')
          .where('schools.url_name', req.params.school)
          .andWhere('posts_schools.visible', true)
          .orderBy('posts.created_at', 'desc');
      });

    let posts = await q.fetch({withRelated: ['user', 'likers', 'favourers', 'labels', 'schools', 'geotags']});
    posts = posts.serialize();
    posts.forEach(post => {
      post.schools = post.schools.map(school => _.pick(school, 'id', 'name', 'url_name'));
    });

    res.send(posts);
  }

  async geotagPosts(req, res) {
    let Post = this.bookshelf.model('Post');

    let q = Post.forge()
      .query(qb => {
        qb
          .join('geotags_posts', 'posts.id', 'geotags_posts.post_id')
          .join('geotags', 'geotags_posts.geotag_id', 'geotags.id')
          .where('geotags.url_name', req.params.url_name)
          .orderBy('posts.created_at', 'desc')
      });

    let posts = await q.fetchAll({withRelated: ['user', 'likers', 'favourers', 'labels', 'schools', 'geotags']});
    posts = posts.serialize();
    posts.forEach(post => {
      post.schools = post.schools.map(school => _.pick(school, 'id', 'name', 'url_name'));
    });

    res.send(posts);
  }


  async userTags(req, res){
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
      return;
    }
    let Post = this.bookshelf.model('Post');

    let q = Post.forge()
      .query(qb => {
        qb
          .where({user_id: req.session.user})
          .orderBy('posts.created_at', 'desc')
      });

    let posts = await q.fetchAll({require: false, withRelated: ['labels']})

    let label_lists = posts
      .map(row => row.relations.labels.toJSON())
      .filter(labels => labels.length > 0);

    let labels = _.uniq(_.flatten(label_lists), 'id')

    res.send(labels);
  }

  async getPost(req, res) {
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: req.params.id}).fetch({require: true, withRelated: ['user', 'likers', 'favourers', 'labels', 'schools', 'geotags']});
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      res.send(post.toJSON());
    } catch (e) {
      res.sendStatus(404);
      return;
    }
  }

  async userLikedPosts(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
      return;
    }
    let Post = this.bookshelf.model('Post');

    try {
      let likes = await this.bookshelf.knex
        .select('post_id')
        .from('likes')
        .where({user_id: req.session.user})
        .map(row => row.post_id);

      let q = Post.forge()
      .query(qb => {
        qb
          .whereIn('id', likes)
          .orderBy('posts.created_at', 'desc')
      });

      let posts = await q.fetchAll({require: false, withRelated: ['user', 'likers', 'favourers', 'labels', 'geotags']});

      res.send(posts);
    } catch (ex) {
      res.status(500);
      res.send(ex.message);
      return;
    }
  }

  async getLikedPosts(req, res) {
    let Post = this.bookshelf.model('Post');

    try {
      let user_id = await this.bookshelf.knex
        .select('id')
        .from('users')
        .where('users.username', '=', req.params.user)
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

      res.send(posts);
    } catch (ex) {
      res.status(500);
      res.send(ex.message);
      return;
    }
  }

  async userFavouredPosts(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
      return;
    }
    let Post = this.bookshelf.model('Post');

    try {
      let favourites = await this.bookshelf.knex
        .select('post_id')
        .from('favourites')
        .where({user_id: req.session.user})
        .map(row => row.post_id);

      let q = Post.forge()
      .query(qb => {
        qb
          .whereIn('id', favourites)
          .orderBy('posts.created_at', 'desc')
      });

      let posts = await q.fetchAll({require: false, withRelated: ['user', 'likers', 'favourers', 'labels', 'geotags']});

      res.send(posts);
    } catch (ex) {
      res.status(500);
      res.send(ex.message);
      return;
    }
  }

  async getFavouredPosts(req, res) {
    let Post = this.bookshelf.model('Post');

    try {
      let user_id = await this.bookshelf.knex
        .select('id')
        .from('users')
        .where('users.username', '=', req.params.user)
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

      res.send(posts);
    } catch (ex) {
      res.status(500);
      res.send(ex.message);
      return;
    }
  }

  async getSchool(req, res) {
    let School = this.bookshelf.model('School');

    try {
      let school = await School
        .where({url_name: req.params.url_name})
        .fetch({require: true, withRelated: 'images'});

      res.send(school.toJSON());
    } catch (e) {
      res.sendStatus(404)
      return;
    }
  }

  async getSchools(req, res) {
    let School = this.bookshelf.model('School');

    try {
      let schools = await School.fetchAll({withRelated: 'images'});
      res.send(schools.toJSON());
    } catch (e) {
      res.sendStatus(404);
      return;
    }
  }

  async getCountries(req, res) {
    let Country = this.bookshelf.model('Country');

    try {
      let countries = await Country.fetchAll();
      res.send(countries.toJSON());
    } catch (e) {
      res.sendStatus(404)
      return;
    }
  }

  async getCountry(req, res) {
    let Country = this.bookshelf.model('Country');

    try {
      let country = await Country.where({iso_alpha2: req.params.code}).fetch();
      res.send(country.toJSON());
    } catch (e) {
      res.sendStatus(404)
      return;
    }
  }

  async getCity(req, res) {
    let City = this.bookshelf.model('City');

    try {
      let city = await City.where({id: req.params.id}).fetch();
      res.send(city.toJSON());
    } catch (e) {
      res.sendStatus(404)
      return;
    }
  }

  async updateSchool(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    if (!('id' in req.params)) {
      res.status(400);
      res.send({error: '"id" parameter is not given'});
      return;
    }

    let images;

    if (req.body.images) {
      if (!_.isArray(req.body.images)) {
        res.status(400);
        res.send({error: `"images" parameter is expected to be an array`});
        return;
      }

      images = _.unique(req.body.images);
    }

    let School = this.bookshelf.model('School');

    try {
      let school = await School.where({id: req.params.id}).fetch({require: true, withRelated: 'images'});
      let newAttributes = _.pick(req.body, 'name', 'description', 'more', 'lat', 'lon');

      if (_.isArray(images)) {
        school.updateImages(images);
      }

      school.set(newAttributes);
      await school.save();

      res.send(school);
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
      return;
    }
  }

  async likePost(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let result = { success: false };

    let User = this.bookshelf.model('User');
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: req.params.id}).fetch({require: true});
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['liked_posts']});

      await user.liked_posts().attach(post);

      post = await Post.where({id: req.params.id}).fetch({require: true, withRelated: ['likers']});

      let likes = await this.bookshelf.knex
        .select('post_id')
        .from('likes')
        .where({user_id: req.session.user});

      result.success = true;
      result.likes = likes.map(row => row.post_id);
      result.likers = post.relations.likers;
    } catch (ex) {
      res.status(500);
      result.error = ex.message;
    }

    res.send(result);
  }

  async unlikePost(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
      return;
    }

    let result = { success: false };

    let User = this.bookshelf.model('User');
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: req.params.id}).fetch({require: true});
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['liked_posts']});

      await user.liked_posts().detach(post);

      post = await Post.where({id: req.params.id}).fetch({require: true, withRelated: ['likers']});

      let likes = await this.bookshelf.knex
        .select('post_id')
        .from('likes')
        .where({user_id: req.session.user});

      result.success = true;
      result.likes = likes.map(row => row.post_id);
      result.likers = post.relations.likers;
    } catch (ex) {
      res.status(500);
      result.error = ex.message;
    }

    res.send(result);
  }

  async favPost(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let result = { success: false };

    let User = this.bookshelf.model('User');
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: req.params.id}).fetch({require: true});
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['favourited_posts']});

      await user.favourited_posts().attach(post);

      post = await Post.where({id: req.params.id}).fetch({require: true, withRelated: ['favourers']});

      let favs = await this.bookshelf.knex
        .select('post_id')
        .from('favourites')
        .where({user_id: req.session.user});

      result.success = true;
      result.favourites = favs.map(row => row.post_id);
      result.favourers = post.relations.favourers;
    } catch (ex) {
      res.status(500);
      result.error = ex.message;
    }

    res.send(result);
  }

  async unfavPost(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let result = { success: false };

    let User = this.bookshelf.model('User');
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: req.params.id}).fetch({require: true});
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['favourited_posts']});

      await user.favourited_posts().detach(post);

      post = await Post.where({id: req.params.id}).fetch({require: true, withRelated: ['favourers']});

      let favs = await this.bookshelf.knex
        .select('post_id')
        .from('favourites')
        .where({user_id: req.session.user});

      result.success = true;
      result.favourites = favs.map(row => row.post_id);
      result.favourers = post.relations.favourers;
    } catch (ex) {
      res.status(500);
      result.error = ex.message;
    }

    res.send(result);
  }

  async subscriptions(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let uid = req.session.user;
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

    res.send(posts);
  }

  async registerUser(req, res) {
    let requiredFields = ['username', 'password', 'email'];
    let optionalFields = ['firstName', 'lastName'];

    for (let fieldName of requiredFields) {
      if (!(fieldName in req.body)) {
        res.status(400);
        res.send({error: 'Bad Request'});
        return
      }
    }

    if (req.body.username.length > 31) { // punycode js can be used for unicode
      res.status(400);
      res.send({error: 'Username maximum length is 31.'});
      return;
    }

    // user input validation
    // 1) UN is max. 31 characters
    // 2) UN can contain letters (a-z), numbers (0-9), dashes (-), underscores (_), apostrophes ('}, and periods (.).
    // 3) UN can't contain an equal sign (=), brackets (<,>), plus sign (+), a comma (,), or more than one period (.) in a row
    // 4) P is min. 8 charachters
    // 5) P can contain any combination of ASCII characters
    // 6) FN  supports unicode/UTF-8 characters, with a maximum of 60 characters.
    // 7) LN supports unicode/UTF-8 characters, with a maximum of 60 characters.
    // 8) E supports User_Registation_01_mail_validation_01"

    let User = this.bookshelf.model('User');

    {
      let check = await User.where({username: req.body.username}).fetch({require: false});
      if (check) {
        res.status(409);
        res.send({error: 'User with this username is already registered'});
        return;
      }
    }

    {
      let check = await User.where({email: req.body.email}).fetch({require: false});
      if (check) {
        res.status(409);
        res.send({error: 'User with this email is already registered'});
        return;
      }
    }

    let moreData = {};
    for (let fieldName of optionalFields) {
      if (fieldName in req.body) {
        moreData[fieldName] = req.body[fieldName];
      }
    }

    moreData.first_login = true;

    let user;

    try {
      user = await User.create(req.body.username, req.body.password, req.body.email, moreData);
    } catch (e) {
      if (e.code == 23505) {
        res.status(401);
        res.send({error: 'User already exists'});
        return;
      }

      throw e;
    }

    createJob('register-user-email', {
      username: user.get('username'),
      email: user.get('email'),
      hash: user.get('email_check_hash')
    });

    res.send({success: true, user: user});
  }

  async login(req, res) {
    if (!req.session) {
      res.status(500);
      res.send({error: 'Internal Server Error'});
      console.error('Session engine is not available, have you started redis service?');  // eslint-disable-line no-console
      return;
    }

    let requiredFields = ['username', 'password'];

    for (let fieldName of requiredFields) {
      if (!(fieldName in req.body)) {
        res.status(400);
        res.send({error: 'Bad Request'});
        return;
      }
    }

    let User = this.bookshelf.model('User');

    let user;

    try {
      user = await new User({username: req.body.username}).fetch({require: true});
    } catch (e) {
      console.warn(`Someone tried to log in as '${req.body.username}', but there's no such user`);  // eslint-disable-line no-console
      res.status(401);
      res.send({success: false});
      return
    }

    let passwordIsValid = await bcryptAsync.compareAsync(req.body.password, user.get('hashed_password'));

    if (!passwordIsValid) {
      console.warn(`Someone tried to log in as '${req.body.username}', but used wrong pasword`);  // eslint-disable-line no-console
      res.status(401);
      res.send({success: false});
      return
    }

    if (user.get('email_check_hash')) {
      console.warn(`user '${req.body.username}' has not validated email`); // eslint-disable-line no-console
      res.status(401);
      res.send({success: false, error: 'Please follow the instructions mailed to you during registration.'});
      return;
    }

    req.session.user = user.id;
    user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['following', 'followers', 'liked_posts', 'favourited_posts']});

    res.send({ success: true, user });
  }

  async verifyEmail(req, res) {
    let User = this.bookshelf.model('User');

    let user;

    try {
      user = await new User({email_check_hash: req.params.hash}).fetch({require: true});
    } catch (e) {
      console.warn(`Someone tried to verify email, but used invalid hash`);  // eslint-disable-line no-console
      res.status(401);
      res.send({success: false});
      return;
    }

    user.set('email_check_hash', '');
    await user.save(null, {method: 'update'});

    createJob('verify-email', {
      username: user.get('username'),
      email: user.get('email')
    });

    res.redirect('/');
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
  async resetPassword(req, res) {

    if (req.session && req.session.user) {
      res.status(403);
      res.send({error: 'Please use profile change password feature.'});
      return;
    }

    for (let fieldName of ['email']) {
      if (!(fieldName in req.body)) {
        res.status(400);
        res.send({error: 'Bad Request'});
        return;
      }
    }

    let User = this.bookshelf.model('User');

    let user;

    try {
      user = await new User({email: req.body.email}).fetch({require: true});
    } catch (e) {
      // we do not show any error if we do not have user.
      // To prevent disclosure information about registered emails.
      res.status(200);
      res.send({success: true});
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
      email: req.body.email,
      hash: user.get('reset_password_hash')
    });

    res.status(200);
    res.send({success: true});
  }

  /**
   * New password form action.
   * Validates new password form with password/password repeat values.
   * Saves new password to User model.
   */
  async newPassword(req, res) {

    if (req.session && req.session.user) {
      res.redirect('/');
    }

    let User = this.bookshelf.model('User');

    let user;

    try {
      user = await new User({reset_password_hash: req.params.hash}).fetch({require: true});
    } catch (e) {
      console.warn(`Someone tried to reset password using unknown reset-hash`);  // eslint-disable-line no-console
      res.status(401);
      res.send({success: false});
      return;
    }

    if (!('password' in req.body) || !('password_repeat' in req.body)) {
      res.status(400);
      res.send({error: '"password" or "password_repeat" parameter is not provided'});
      return;
    }

    if (req.body.password !== req.body.password_repeat) {
      res.status(400);
      res.send({error: '"password" and "password_repeat" do not exact match.'});
      return;
    }

    let hashedPassword = await bcryptAsync.hashAsync(req.body.password, 10);

    user.set('hashed_password', hashedPassword);
    user.set('reset_password_hash', '');

    await user.save(null, {method: 'update'});
    res.send({success: true});

  }

  async logout(req, res) {
    if (req.session && req.session.user) {
      req.session.destroy();
    }
    res.redirect('/');
  }

  async userSuggestions(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let following = await this.bookshelf.knex
      .select('followers.following_user_id')
      .from('followers')
      .where('followers.user_id', '=', req.session.user)
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
              .where('users.id', '!=', req.session.user)
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

    res.send(suggestions);
  }

  async initialSuggestions(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let User = this.bookshelf.model('User');

    let q = User.forge()
      .query(qb => {
        qb
          .select('users.*')
          .count('posts.id as post_count')
          .from('users')
          .where('users.id', '!=', req.session.user)
          .leftJoin('posts', 'users.id', 'posts.user_id')
          .groupBy('users.id')
          .orderBy('post_count', 'desc')
          .limit(20)
      })

    let suggestions = await q.fetchAll({require: true, withRelated: ['following', 'followers', 'liked_posts', 'favourited_posts']});

    res.send(suggestions);
  }

  async createPost(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    if (!('type' in req.body)) {
      res.status(400);
      res.send({error: '"type" parameter is not given'});
      return;
    }

    let typeRequirements = {
      short_text: ['text'],
      long_text: ['title', 'text']
    };

    if (!(req.body.type in typeRequirements)) {
      res.status(400);
      res.send({error: `"${req.body.type}" type is not supported`});
      return;
    }

    let thisTypeRequirements = typeRequirements[req.body.type];

    for (let varName of thisTypeRequirements) {
      if (!(varName in req.body)) {
        res.status(400);
        res.send({error: `"${varName}" parameter is not given`});
        return;
      }
    }

    let tags;

    if ('tags' in req.body) {
      if (!_.isArray(req.body.tags)) {
        res.status(400);
        res.send({error: `"tags" parameter is expected to be an array`});
        return;
      }

      if (req.body.tags.filter(tag => (countBreaks(tag) < 3)).length > 0) {
        res.status(400);
        res.send({error: `each of tags should be at least 3 characters wide`});
        return;
      }

      tags = _.unique(req.body.tags);
    }

    let schools;

    if ('schools' in req.body) {
      if (!_.isArray(req.body.schools)) {
        res.status(400);
        res.send({error: `"schools" parameter is expected to be an array`});
        return;
      }

      schools = _.unique(req.body.schools);
    }

    let geotags;

    if ('geotags' in req.body) {
      if (!_.isArray(req.body.geotags)) {
        res.status(400);
        res.send({error: `"geotags" parameter is expected to be an array`});
        return;
      }

      geotags = _.unique(req.body.geotags);
    }

    let Post = this.bookshelf.model('Post');

    let obj = new Post({
      id: uuid.v4(),
      type: req.body.type,
      user_id: req.session.user
    });

    if (req.body.type === 'short_text') {
      obj.set('text', req.body.text);
    } else if (req.body.type === 'long_text') {
      obj.set('text', req.body.text);
      obj.set('more', {title: req.body.title});
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

      res.send(obj.toJSON());
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
      return;
    }
  }

  async updatePost(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    if (!('id' in req.params)) {
      res.status(400);
      res.send({error: '"id" parameter is not given'});
      return;
    }

    let Post = this.bookshelf.model('Post');

    let post_object;

    try {
      post_object = await Post.where({ id: req.params.id, user_id: req.session.user }).fetch({require: true, withRelated: ['labels']});
    } catch(e) {
      res.status(500);
      res.send({error: e.message});
      return
    }

    let type = post_object.get('type');

    let tags;

    if ('tags' in req.body) {
      if (!_.isArray(req.body.tags)) {
        res.status(400);
        res.send({error: `"tags" parameter is expected to be an array`});
        return;
      }

      if (req.body.tags.filter(tag => (countBreaks(tag) < 3)).length > 0) {
        res.status(400);
        res.send({error: `each of tags should be at least 3 characters wide`});
        return;
      }

      tags = _.unique(req.body.tags);
    }

    let schools;

    if ('schools' in req.body) {
      if (!_.isArray(req.body.schools)) {
        res.status(400);
        res.send({error: `"schools" parameter is expected to be an array`});
        return;
      }

      schools = _.unique(req.body.schools);
    }

    let geotags;

    if ('geotags' in req.body) {
      if (!_.isArray(req.body.geotags)) {
        res.status(400);
        res.send({error: `"geotags" parameter is expected to be an array`});
        return;
      }

      geotags = _.unique(req.body.geotags);
    }

    if (type === 'short_text') {
      if ('text' in req.body) {
        post_object.set('text', req.body.text);
      }
    } else if (type === 'long_text') {
      if ('text' in req.body) {
        post_object.set('text', req.body.text);
      }

      if ('title' in req.body) {
        let more = post_object.get('more');
        more.title = req.body.title;
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

      res.send(post_object.toJSON());
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
      return;
    }
  }

  async removePost(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    if (!('id' in req.params)) {
      res.status(400);
      res.send({error: '"id" parameter is not given'});
      return;
    }

    let Post = this.bookshelf.model('Post');

    try {
      let post_object = await Post.where({ id: req.params.id, user_id: req.session.user }).fetch({require: true});
      post_object.destroy();
    } catch(e) {
      res.status(500);
      res.send({error: e.message});
      return;
    }
    res.status(200);
    res.send({success: true});
  }

  async getUser(req, res) {
    let User = this.bookshelf.model('User');
    let u = await User
      .where({username: req.params.username})
      .fetch({
        require: true,
        withRelated: [
          'following', 'followers', 'liked_posts',
          'favourited_posts', 'followed_labels',
          'followed_schools', 'followed_geotags'
        ]
      });

    res.send(u.toJSON());
  }

  async followUser(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let User = this.bookshelf.model('User');
    let follow_status = { success: false };

    try {
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['following', 'followers']});
      let follow = await User.where({username: req.params.username}).fetch({require: true, withRelated: ['following', 'followers']});

      if (user.id != follow.id && _.isUndefined(user.related('following').find({id: follow.id}))) {
        await user.following().attach(follow);

        follow_status.success = true;
        user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['following', 'followers']});
        follow = await User.where({username: req.params.username}).fetch({require: true, withRelated: ['following', 'followers']});
      }

      follow_status.user1 = user.toJSON();
      follow_status.user2 = follow.toJSON();
    } catch(ex) {
      res.status(500);
      follow_status.error = ex.message;
    }

    res.send(follow_status);
  }

  async updateUser(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let User = this.bookshelf.model('User');

    try {
      let user = await User.where({id: req.session.user}).fetch({require: true});

      if(!_.isEmpty(req.body.more)) {
        let properties = _.extend(user.get('more'), req.body.more);
        user.set('more', properties);
      }

      await user.save(null, {method: 'update'});

      res.send({user});
    } catch(e) {
      res.status(500);
      res.send({error: 'Update failed'});
      return;
    }
  }

  async changePassword(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    if (!('old_password' in req.body) || !('new_password' in req.body)) {
      res.status(400);
      res.send({error: '"old_password" or "new_password" parameter is not provided'});
      return;
    }

    let User = this.bookshelf.model('User');

    try {
      let user = await User.where({id: req.session.user}).fetch({require: true});

      let passwordIsValid = await bcryptAsync.compareAsync(req.body.old_password, user.get('hashed_password'));

      if (!passwordIsValid) {
        res.status(401);
        res.send({error: 'old password is incorrect'});
        return
      }

      let hashedPassword = await bcryptAsync.hashAsync(req.body.new_password, 10);

      user.set('hashed_password', hashedPassword);

      await user.save(null, {method: 'update'});

      res.send({success: true});
    } catch(e) {
      res.status(500);
      res.send({error: 'Update failed'});
      return;
    }
  }

  async unfollowUser(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let User = this.bookshelf.model('User');
    let follow_status = { success: false };

    try {
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['following', 'followers']});
      let follow = await User.where({username: req.params.username}).fetch({require: true, withRelated: ['following', 'followers']});

      if (user.id != follow.id && !_.isUndefined(user.related('following').find({id: follow.id}))) {
        await user.following().detach(follow);

        follow_status.success = true;
        user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['following', 'followers']});
        follow = await User.where({username: req.params.username}).fetch({require: true, withRelated: ['following', 'followers']});
      }

      follow_status.user1 = user.toJSON();
      follow_status.user2 = follow.toJSON();
    } catch(ex) {
      res.status(500);
      follow_status.error = ex.message;
    }

    res.send(follow_status);
  }

  /**
   * Creates attachments from 'files'.
   * Important: set the 'name' property of each file input to 'files', not 'files[]' or 'files[0]'
   */
  async uploadFiles(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    if (!req.files || !req.files.length) {
      res.status(400);
      res.send({error: '"files" parameter is not provided'});
      return;
    }

    let Attachment = this.bookshelf.model('Attachment');

    try {
      let promises = req.files.map(file => {
        return Attachment.create(
          file.originalname,
          file.buffer,
          {user_id: req.session.user}
        );
      });

      let attachments = await Promise.all(promises);

      res.send({success: true, attachments});
    } catch (e) {
      res.status(500);
      res.send({error: `Upload failed: ${e.stack}`});
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
  async processImage(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    if (!req.body.original_id) {
      res.status(400);
      res.send({error: '"original_id" parameter is not provided'});
      return;
    }

    if (!req.body.transforms) {
      res.status(400);
      res.send({error: '"transforms" parameter is not provided'});
      return;
    }

    let Attachment = this.bookshelf.model('Attachment');

    try {
      let result;
      let transforms = JSON.parse(req.body.transforms);

      // Get the original attachment, checking ownership.
      let original = await Attachment
        .forge()
        .query(qb => {
          qb
            .where('id', req.body.original_id)
            .andWhere('user_id', req.session.user);
        })
        .fetch({require: true});

      // Check if the format of the attachment is supported.
      let { supportedImageFormats } = config.attachments;
      if (supportedImageFormats.indexOf(original.attributes.mime_type) < 0) {
        res.status(400);
        res.send({error: 'Image type is not supported'});
        return;
      }

      // Download the original attachment data from s3.
      let originalData = await original.download();

      // Process the data.
      let newImage = await processImage(originalData.Body, transforms);
      let imageBuffer = await newImage.toBufferAsync(original.extension());

      // Update the attachment specified in derived_id or create a new one.
      if (req.body.derived_id) {
        let oldAttachment = await Attachment
          .forge()
          .query(qb => {
            qb
              .where('id', req.body.derived_id)
              .andWhere('user_id', req.session.user);
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

      res.send({success: true, attachment: result});
    } catch (e) {
      res.status(500);
      res.send({error: `Image transformation failed: ${e.message}`});
      return;
    }

  }

  async pickpoint(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    try {
      let response = await request
        .get(`https://pickpoint.io/api/v1/forward`)
        .query(Object.assign(req.query, {key: config.pickpoint.key}));

      // pickpoint answers with wrong content-type, so we do decoding manually
      let responseText = response.text;
      let data = JSON.parse(responseText);

      res.send(data);
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
      return;
    }
  }

  /**
   * Returns 50 most popular labels sorted by post count.
   * Each label in response contains post_count.
   */
  async getTagCloud(req, res) {
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

      res.send(labels);
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
      return;
    }
  }

  async followTag(req, res) {
    let User = this.bookshelf.model('User');
    let Label = this.bookshelf.model('Label');

    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    if (!req.params.name) {
      res.status(400);
      res.send({error: '"name" parameter is not given'});
      return;
    }

    try {
      let currentUser = await User.forge().where('id', req.session.user).fetch();
      let label = await Label.forge().where('name', req.params.name).fetch();

      await currentUser.followLabel(label.id);

      res.send({success: true, tag: label});
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
      return;
    }
  }

  async unfollowTag(req, res) {
    let User = this.bookshelf.model('User');
    let Label = this.bookshelf.model('Label');

    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    if (!req.params.name) {
      res.status(400);
      res.send({error: '"name" parameter is not given'});
      return;
    }

    try {
      let currentUser = await User.forge().where('id', req.session.user).fetch();
      let label = await Label.forge().where('name', req.params.name).fetch();

      await currentUser.unfollowLabel(label.id);

      res.send({success: true, tag: label});
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
      return;
    }
  }

  async followSchool(req, res) {
    let User = this.bookshelf.model('User');
    let School = this.bookshelf.model('School');

    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    if (!req.params.name) {
      res.status(400);
      res.send({error: '"name" parameter is not given'});
      return;
    }

    try {
      let currentUser = await User.forge().where('id', req.session.user).fetch();
      let school = await School.forge().where('url_name', req.params.name).fetch({require: true});

      await currentUser.followSchool(school.id);

      res.send({success: true, school});
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
      return;
    }
  }

  async unfollowSchool(req, res) {
    let User = this.bookshelf.model('User');
    let School = this.bookshelf.model('School');

    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    if (!req.params.name) {
      res.status(400);
      res.send({error: '"name" parameter is not given'});
      return;
    }

    try {
      let currentUser = await User.forge().where('id', req.session.user).fetch();
      let school = await School.forge().where('url_name', req.params.name).fetch({require: true});

      await currentUser.unfollowSchool(school.id);

      res.send({success: true, school});
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
      return;
    }
  }

  async followGeotag(req, res) {
    let User = this.bookshelf.model('User');
    let Geotag = this.bookshelf.model('Geotag');

    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    if (!req.params.url_name) {
      res.status(400);
      res.send({error: '"url_name" parameter is not given'});
      return;
    }

    try {
      let currentUser = await User.forge().where('id', req.session.user).fetch();
      let geotag = await Geotag.forge().where('url_name', req.params.url_name).fetch();

      await currentUser.followGeotag(geotag.id);

      res.send({success: true, geotag});
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
      return;
    }
  }

  async unfollowGeotag(req, res) {
    let User = this.bookshelf.model('User');
    let Geotag = this.bookshelf.model('Geotag');

    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    if (!req.params.url_name) {
      res.status(400);
      res.send({error: '"url_name" parameter is not given'});
      return;
    }

    try {
      let currentUser = await User.forge().where('id', req.session.user).fetch();
      let geotag = await Geotag.forge().where('url_name', req.params.url_name).fetch();

      await currentUser.unfollowGeotag(geotag.id);

      res.send({success: true, geotag});
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
      return;
    }
  }

  async getGeotag(req, res) {
    let Geotag = this.bookshelf.model('Geotag');

    if (!req.params.url_name) {
      res.status(400);
      res.send({error: '"url_name" parameter is not given'});
      return;
    }

    try {
      let geotag = await Geotag
        .forge()
        .where('url_name', req.params.url_name)
        .fetch({require: true, withRelated: ['country', 'city']});

      res.send(geotag);
    } catch (e) {
      res.sendStatus(404);
      return;
    }
  }

  async searchGeotags(req, res) {
    let Geotag = this.bookshelf.model('Geotag');

    try {
      let geotags = await Geotag.collection().query(function (qb) {
        qb
          .where('name', 'ILIKE',  `${req.params.query}%`)
          .limit(10);
      }).fetch(/*{withRelated: 'place'}*/);

      res.send({geotags});
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
      return;
    }
  }
}
