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
import QueueSingleton from '../utils/queue';
import Checkit from 'checkit';

import { processImage } from '../utils/image';
import config from '../../config';
import { User as UserValidators } from './db/validators';

let bcryptAsync = bb.promisifyAll(bcrypt);
const POST_RELATIONS = [
  'user', 'likers', 'favourers', 'hashtags', 'schools',
  'geotags', 'liked_hashtag', 'liked_school', 'liked_geotag'
];

export default class ApiController {
  constructor (bookshelf) {
    this.bookshelf = bookshelf;
    this.queue = new QueueSingleton;
  }

  async test(req, res) {
    res.send({hello: 'world'});
  }

  async allPosts(req, res) {
    let Posts = this.bookshelf.collection('Posts');
    let posts = new Posts();
    let response = await posts.fetch({require: false, withRelated: POST_RELATIONS});
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
          .whereIn('posts.type', ['short_text', 'long_text']);
      });


    let posts = await q.fetchAll({require: false, withRelated: POST_RELATIONS});

    let post_comments_count = await this.countComments(posts);

    posts = posts.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      post.attributes.comments = post_comments_count[post.get('id')];
      return post;
    });

    res.send(posts);
  }

  async tagPosts(req, res) {
    let Post = this.bookshelf.model('Post');

    let q = Post.forge()
      .query(qb => {
        qb
          .join('hashtags_posts', 'posts.id', 'hashtags_posts.post_id')
          .join('hashtags', 'hashtags_posts.hashtag_id', 'hashtags.id')
          .where('hashtags.name', '=', req.params.tag)
          .orderBy('posts.created_at', 'desc')
      });

    let posts = await q.fetchAll({require: false, withRelated: POST_RELATIONS});

    let post_comments_count = await this.countComments(posts);

    posts = posts.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      post.attributes.comments = post_comments_count[post.get('id')];
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

    let posts = await q.fetch({withRelated: POST_RELATIONS});
    let post_comments_count = await this.countComments(posts);

    posts = posts.map(post => {
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      post.attributes.comments = post_comments_count[post.get('id')];
      return post;
    });

    res.send(posts);
  }

  async geotagPosts(req, res) {
    const Post = this.bookshelf.model('Post');
    const Geotag = this.bookshelf.model('Geotag');

    try {
      const geotag = await Geotag
        .forge()
        .where({url_name: req.params.url_name})
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

      res.send(posts);
    } catch (e) {
      res.sendStatus(404);
      return;
    }
  }


  async userTags(req, res){
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
      return;
    }
    let Hashtag = this.bookshelf.model('Hashtag');
    let hashtags = await Hashtag
      .collection()
      .query(qb => {
        qb
          .join('hashtags_posts', 'hashtags_posts.hashtag_id', 'hashtags.id')
          .join('posts', 'hashtags_posts.post_id', 'posts.id')
          .where('posts.user_id', req.session.user)
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
          .where('posts.user_id', req.session.user)
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
          .where('posts.user_id', req.session.user)
          .distinct()
      })
      .fetch();

    res.send({ hashtags, schools, geotags });
  }

  async getPost(req, res) {
    let Post = this.bookshelf.model('Post');

    try {
      let relations = POST_RELATIONS;
      relations.push({'post_comments': qb => { qb.orderBy('created_at'); }});
      relations.push('post_comments.user');

      let post = await Post.where({id: req.params.id}).fetch({require: true, withRelated: relations});
      post.relations.schools = post.relations.schools.map(row => ({id: row.id, name: row.attributes.name, url_name: row.attributes.url_name}));
      post.attributes.comments = post.relations.post_comments.length;
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

      let posts = await q.fetchAll({require: false, withRelated: POST_RELATIONS});
      let post_comments_count = await this.countComments(posts);
      posts = posts.map(post => {
        post.attributes.comments = post_comments_count[post.get('id')];
        return post;
      });
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
          .select()
          .from('posts')
          .whereIn('id', likes)
          .union(function() {
            this
              .select()
              .from('posts')
              .whereIn('type', ['hashtag_like', 'school_like', 'geotag_like'])
              .andWhere('user_id', user_id[0]);
          })
          .orderBy('created_at', 'desc');
      });

      let posts = await q.fetchAll({require: false, withRelated: POST_RELATIONS});
      let post_comments_count = await this.countComments(posts);
      posts = posts.map(post => {
        post.attributes.comments = post_comments_count[post.get('id')];
        return post;
      });
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

      let posts = await q.fetchAll({require: false, withRelated: POST_RELATIONS});
      let post_comments_count = await this.countComments(posts);
      posts = posts.map(post => {
        post.attributes.comments = post_comments_count[post.get('id')];
        return post;
      });
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

      let posts = await q.fetchAll({require: false, withRelated: POST_RELATIONS});
      let post_comments_count = await this.countComments(posts);
      posts = posts.map(post => {
        post.attributes.comments = post_comments_count[post.get('id')];
        return post;
      });
      res.send(posts);
    } catch (ex) {
      res.status(500);
      res.send(ex.message);
      return;
    }
  }

  async checkSchoolExists(req, res) {
    let School = this.bookshelf.model('School');

    try {
      await School.where('name', req.params.name).fetch({require: true});

      res.end();
    } catch (e) {
      res.status(404).end();
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

      images = _.uniq(req.body.images);
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

    const offset = ('offset' in req.query) ? parseInt(req.query.offset, 10) : 0;

    let q = Post.forge()
      .query(qb => {
        qb
          .leftJoin('followers', 'followers.following_user_id', 'posts.user_id')
          .whereRaw('(followers.user_id = ? OR posts.user_id = ?)', [uid, uid])  // followed posts
          .whereRaw('(posts.fully_published_at IS NOT NULL OR posts.user_id = ?)', [uid]) // only major and own posts
          .orderByRaw(`
            CASE WHEN posts.fully_published_at IS NOT NULL
              THEN posts.fully_published_at
              ELSE posts.created_at
            END DESC
          `)
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

    res.send(posts);
  }

  async checkUserExists(req, res) {
    let User = this.bookshelf.model('User');

    try {
      await User
        .forge()
        .where('username', req.params.username)
        .fetch({require: true});

      res.end();
    } catch (e) {
      res.status(404).end();
    }
  }

  async checkEmailTaken(req, res) {
    let User = this.bookshelf.model('User');

    try {
      await User
        .forge()
        .where('email', req.params.email)
        .fetch({require: true});

      res.end();
    } catch (e) {
      res.status(404).end();
    }
  }

  async getAvailableUsername(req, res) {
    let User = this.bookshelf.model('User');

    async function checkUserExists(username) {
      let user = await User
        .forge()
        .where('username', username)
        .fetch();

      return !!user;
    }

    try {
      let username = req.params.username;

      for (let i = 1; await checkUserExists(username); ++i) {
        username = `${req.params.username}${i}`;
      }

      res.send({username});
    } catch (e) {
      res.status(404);
      res.send({error: e.message});
    }
  }

  async registerUser(req, res) {
    let optionalFields = ['firstName', 'lastName'];

    let checkit = new Checkit(UserValidators.registration);
    try {
      await checkit.run(req.body);
    } catch (e) {
      res.status(400);
      res.send({error: e.toJSON()});
      return;
    }

    const User = this.bookshelf.model('User');
    const username = req.body.username.toLowerCase();

    {
      const check = await User.where({ username }).fetch({require: false});
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
      user = await User.create(username, req.body.password, req.body.email, moreData);
    } catch (e) {
      if (e.code == 23505) {
        res.status(401);
        res.send({error: 'User already exists'});
        return;
      }

      throw e;
    }

    this.queue.createJob('register-user-email', {
      username: user.get('username'),
      email: user.get('email'),
      hash: user.get('email_check_hash')
    });

    res.send({ success: true, user });
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
    const username = req.body.username.toLowerCase();

    let user;

    try {
      user = await new User({ username }).fetch({require: true});
    } catch (e) {
      console.warn(`Someone tried to log in as '${username}', but there's no such user`);  // eslint-disable-line no-console
      res.status(401);
      res.send({success: false});
      return
    }

    let passwordIsValid = await bcryptAsync.compareAsync(req.body.password, user.get('hashed_password'));

    if (!passwordIsValid) {
      console.warn(`Someone tried to log in as '${username}', but used wrong pasword`);  // eslint-disable-line no-console
      res.status(401);
      res.send({success: false});
      return
    }

    if (user.get('email_check_hash')) {
      console.warn(`user '${username}' has not validated email`); // eslint-disable-line no-console
      res.status(401);
      res.send({success: false, error: 'Please follow the instructions mailed to you during registration.'});
      return;
    }

    req.session.user = user.id;
    user = await User
      .where({id: req.session.user})
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

    this.queue.createJob('verify-email', {
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

    this.queue.createJob('reset-password-email', {
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

    const User = this.bookshelf.model('User');

    const user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['ignored_users', 'following']});

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
              .where('users.id', '!=', req.session.user)
              .leftJoin('posts', 'users.id', 'posts.user_id')
              .groupBy('users.id')
              .as('active_users');
          })
          .whereNotIn('active_users.id', usersToIgnore)
          .orderBy('post_count', 'desc')
          .limit(6);
      })
      .fetch({withRelated: ['following', 'followers', 'liked_posts', 'favourited_posts']});

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

    let hashtags;

    if ('hashtags' in req.body) {
      if (!_.isArray(req.body.hashtags)) {
        res.status(400);
        res.send({error: `"hashtags" parameter is expected to be an array`});
        return;
      }

      if (req.body.hashtags.filter(tag => (countBreaks(tag) < 3)).length > 0) {
        res.status(400);
        res.send({error: `each of tags should be at least 3 characters wide`});
        return;
      }

      hashtags = _.uniq(req.body.hashtags);
    }

    let schools;

    if ('schools' in req.body) {
      if (!_.isArray(req.body.schools)) {
        res.status(400);
        res.send({error: `"schools" parameter is expected to be an array`});
        return;
      }

      schools = _.uniq(req.body.schools);
    }

    let geotags;

    if ('geotags' in req.body) {
      if (!_.isArray(req.body.geotags)) {
        res.status(400);
        res.send({error: `"geotags" parameter is expected to be an array`});
        return;
      }

      geotags = _.uniq(req.body.geotags);
    }

    let Post = this.bookshelf.model('Post');

    let obj = new Post({
      id: uuid.v4(),
      type: req.body.type,
      user_id: req.session.user
    });

    const more = {};

    if (req.body.type === 'short_text') {
      obj.set('text', req.body.text);
    } else if (req.body.type === 'long_text') {
      obj.set('text', req.body.text);
      more.title = req.body.title;
    }

    if (!req.body.minor_update) {
      // Show post in the news feed.
      obj.set('fully_published_at', new Date().toJSON());
    }

    if (!Post.typesWithoutPages.includes(obj.get('type'))) {
      const author = await obj.related('user').fetch();
      more.pageTitle = await Post.titleFromText(req.body.text, author.get('fullName'));

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
      post_object = await Post.where({ id: req.params.id, user_id: req.session.user }).fetch({require: true, withRelated: ['hashtags']});
    } catch(e) {
      res.status(500);
      res.send({error: e.message});
      return
    }

    let type = post_object.get('type');

    let hashtags;

    if ('hashtags' in req.body) {
      if (!_.isArray(req.body.hashtags)) {
        res.status(400);
        res.send({error: `"hashtags" parameter is expected to be an array`});
        return;
      }

      if (req.body.hashtags.filter(tag => (countBreaks(tag) < 3)).length > 0) {
        res.status(400);
        res.send({error: `each of tags should be at least 3 characters wide`});
        return;
      }

      hashtags = _.uniq(req.body.hashtags);
    }

    let schools;

    if ('schools' in req.body) {
      if (!_.isArray(req.body.schools)) {
        res.status(400);
        res.send({error: `"schools" parameter is expected to be an array`});
        return;
      }

      schools = _.uniq(req.body.schools);
    }

    let geotags;

    if ('geotags' in req.body) {
      if (!_.isArray(req.body.geotags)) {
        res.status(400);
        res.send({error: `"geotags" parameter is expected to be an array`});
        return;
      }

      geotags = _.uniq(req.body.geotags);
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

    // toJSON is important. It translates the date to UTC.
    post_object.attributes.updated_at = new Date().toJSON();

    if (!req.body.minor_update && !post_object.attributes.fully_published_at) {
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
      let post_object = await Post.where({ id: req.params.id }).fetch({require: true});

      if (post_object.get('user_id') != req.session.user) {
        res.status(403);
        res.send({error: 'You are not authorized'});
        return;
      }

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
          'liked_hashtags', 'liked_schools', 'liked_geotags',
          'favourited_posts', 'followed_hashtags',
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

  async ignoreUser(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let User = this.bookshelf.model('User');

    let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['ignored_users']});
    let userToIgnore = await User.where({username: req.params.username}).fetch({require: true});

    await user.ignoreUser(userToIgnore.id);

    res.send({success: true});
  }

  async updateUser(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let User = this.bookshelf.model('User');

    let checkit = new Checkit(UserValidators.settings.more);
    try {
      await checkit.run(req.body.more);
    } catch (e) {
      res.status(400);
      res.send({error: e.toJSON()});
      return;
    }

    try {
      let user = await User.where({id: req.session.user}).fetch({require: true});

      let properties = {};

      for (let fieldName in UserValidators.settings.more) {
        if (fieldName in req.body.more) {
          properties[fieldName] = req.body.more[fieldName];
        }
      }

      properties = _.extend(user.get('more'), properties);
      user.set('more', properties);

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
   * Returns 50 most popular hashtags sorted by post count.
   * Each hashtag in response contains post_count.
   */
  async getTagCloud(req, res) {
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

      res.send(hashtags);
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
      return;
    }
  }

  async getSchoolCloud(req, res) {
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

      res.send(schools);
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
    }
  }

  async getGeotagCloud(req, res) {
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

    res.send(geotags);
  }

  async getUserRecentHashtags(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let Hashtag = this.bookshelf.model('Hashtag');

    let hashtags = await Hashtag
      .collection()
      .query(qb => {
        qb
          .join('hashtags_posts', 'hashtags.id', 'hashtags_posts.hashtag_id')
          .join('posts', 'hashtags_posts.post_id', 'posts.id')
          .where('posts.user_id', req.session.user)
          .groupBy('hashtags.id')
          .orderByRaw('MAX(posts.created_at) DESC')
          .limit(5);
      })
      .fetch();

    res.send(hashtags);
  }

  async getUserRecentSchools(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let School = this.bookshelf.model('School');

    let schools = await School
      .collection()
      .query(qb => {
        qb
          .join('posts_schools', 'schools.id', 'posts_schools.school_id')
          .join('posts', 'posts_schools.post_id', 'posts.id')
          .where('posts.user_id', req.session.user)
          .groupBy('schools.id')
          .orderByRaw('MAX(posts.created_at) DESC')
          .limit(5);
      })
      .fetch();

    res.send(schools);
  }

  async getUserRecentGeotags(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let Geotag = this.bookshelf.model('Geotag');

    let geotags = await Geotag
      .collection()
      .query(qb => {
        qb
          .join('geotags_posts', 'geotags.id', 'geotags_posts.geotag_id')
          .join('posts', 'geotags_posts.post_id', 'posts.id')
          .where('posts.user_id', req.session.user)
          .groupBy('geotags.id')
          .orderByRaw('MAX(posts.created_at) DESC')
          .limit(5);
      })
      .fetch();

    res.send(geotags);
  }

  async followTag(req, res) {
    let User = this.bookshelf.model('User');
    let Hashtag = this.bookshelf.model('Hashtag');

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
      let hashtag = await Hashtag.forge().where('name', req.params.name).fetch();

      await currentUser.followHashtag(hashtag.id);

      res.send({success: true, hashtag});
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
      return;
    }
  }

  async unfollowTag(req, res) {
    let User = this.bookshelf.model('User');
    let Hashtag = this.bookshelf.model('Hashtag');

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
      let hashtag = await Hashtag.forge().where('name', req.params.name).fetch();

      await currentUser.unfollowHashtag(hashtag.id);

      res.send({success: true, hashtag});
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

  async checkGeotagExists(req, res) {
    let Geotag = this.bookshelf.model('Geotag');

    try {
      await Geotag.where('name', req.params.name).fetch({require: true});

      res.end();
    } catch (e) {
      res.status(404).end();
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
        .fetch({require: true, withRelated: ['country', 'admin1', 'city', 'continent', 'geonames_city']});

      res.send(geotag);
    } catch (e) {
      res.status(404);
      res.send({error: e.message});
    }
  }

  async getHashtag(req, res) {
    let Hashtag = this.bookshelf.model('Hashtag');

    if (!req.params.name) {
      res.status(400);
      res.send({error: '"name" parameter is not given'});
      return;
    }

    try {
      let hashtag = await Hashtag
        .forge()
        .where('name', req.params.name)
        .fetch({require: true});

      res.send(hashtag);
    } catch (e) {
      res.status(404);
      res.send({error: e.message});
    }
  }

  async searchGeotags(req, res) {
    let Geotag = this.bookshelf.model('Geotag');

    try {
      let geotags = await Geotag.collection().query(function (qb) {
        qb
          .where('name', 'ILIKE',  `${req.params.query}%`)
          .limit(10);
      }).fetch({withRelated: ['country', 'admin1']});

      res.send({geotags});
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
      return;
    }
  }

  async searchTags(req, res) {
    let Hashtag = this.bookshelf.model('Hashtag');

    try {
      let hashtags = await Hashtag.collection().query(function (qb) {
        qb
          .where('name', 'ILIKE', `${req.params.query}%`)
          .limit(10);
      }).fetch();

      res.send({hashtags});
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
    }
  }

  /**
   * Gets 3 related posts ordered by a number of matching tags + a random number between 0 and 3.
   */
  async getRelatedPosts(req, res) {
    function formatArray(array) {
      return `(${array.map(function (e) { return "'" + e + "'"; }).join(',')})`
    }

    let knex = this.bookshelf.knex;
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post
        .forge()
        .where('id', req.params.id)
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

        if (req.session.user) {
          qb.whereNot('posts.user_id', req.session.user);
        }
      }).fetch({withRelated: POST_RELATIONS});
      let post_comments_count = await this.countComments(posts);
      posts = posts.map(post => {
        post.attributes.comments = post_comments_count[post.get('id')];
        return post;
      });
      res.send(posts);
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
    }
  }

  async likeHashtag(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let User = this.bookshelf.model('User');
    let Hashtag = this.bookshelf.model('Hashtag');
    let Post = this.bookshelf.model('Post');

    try {
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['liked_hashtags']});
      let hashtag = await Hashtag.where({name: req.params.name}).fetch({require: true});

      await user.liked_hashtags().detach(hashtag);
      await user.liked_hashtags().attach(hashtag);

      await new Post({
        id: uuid.v4(),
        type: 'hashtag_like',
        liked_hashtag_id: hashtag.id,
        user_id: user.id
      }).save(null, {method: 'insert'});

      res.send({success: true, hashtag});
    } catch (e) {
      res.status(500);
      res.send({error: `Couldn't like the tag: ${e.message}`});
    }
  }


  async unlikeHashtag(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let User = this.bookshelf.model('User');
    let Hashtag = this.bookshelf.model('Hashtag');
    let Post = this.bookshelf.model('Post');

    try {
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['liked_hashtags']});
      let hashtag = await Hashtag.where({name: req.params.name}).fetch({require: true});

      await user.liked_hashtags().detach(hashtag);

      await Post
        .where({
          user_id: user.id,
          liked_hashtag_id: hashtag.id
        })
        .destroy();

      res.send({success: true, hashtag});
    } catch (e) {
      res.status(500);
      res.send({error: `Couldn't unlike the tag: ${e.message}`});
    }
  }

  async likeSchool(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let User = this.bookshelf.model('User');
    let School = this.bookshelf.model('School');
    let Post = this.bookshelf.model('Post');

    try {
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['liked_hashtags']});
      let school = await School.where({url_name: req.params.url_name}).fetch({require: true});

      await user.liked_schools().detach(school);
      await user.liked_schools().attach(school);

      await new Post({
        id: uuid.v4(),
        type: 'school_like',
        liked_school_id: school.id,
        user_id: user.id
      }).save(null, {method: 'insert'});

      res.send({success: true, school});
    } catch (e) {
      res.status(500);
      res.send({error: `Couldn't like the school: ${e.message}`});
    }
  }


  async unlikeSchool(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let User = this.bookshelf.model('User');
    let School = this.bookshelf.model('School');
    let Post = this.bookshelf.model('Post');

    try {
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['liked_hashtags']});
      let school = await School.where({url_name: req.params.url_name}).fetch({require: true});

      await user.liked_schools().detach(school);

      await Post
        .where({
          user_id: user.id,
          liked_school_id: school.id
        })
        .destroy();

      res.send({success: true, school});
    } catch (e) {
      res.status(500);
      res.send({error: `Couldn't unlike the school: ${e.message}`});
    }
  }

  async likeGeotag(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let User = this.bookshelf.model('User');
    let Geotag = this.bookshelf.model('Geotag');
    let Post = this.bookshelf.model('Post');

    try {
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['liked_hashtags']});
      let geotag = await Geotag.where({url_name: req.params.url_name}).fetch({require: true});

      await user.liked_geotags().detach(geotag);
      await user.liked_geotags().attach(geotag);

      await new Post({
        id: uuid.v4(),
        type: 'geotag_like',
        liked_geotag_id: geotag.id,
        user_id: user.id
      }).save(null, {method: 'insert'});

      res.send({success: true, geotag});
    } catch (e) {
      res.status(500);
      res.send({error: `Couldn't like the geotag: ${e.message}`});
    }
  }


  async unlikeGeotag(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let User = this.bookshelf.model('User');
    let Geotag = this.bookshelf.model('Geotag');
    let Post = this.bookshelf.model('Post');

    try {
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['liked_hashtags']});
      let geotag = await Geotag.where({url_name: req.params.url_name}).fetch({require: true});

      await user.liked_geotags().detach(geotag);

      await Post
        .where({
          user_id: user.id,
          liked_geotag_id: geotag.id
        })
        .destroy();

      res.send({success: true, geotag});
    } catch (e) {
      res.status(500);
      res.send({error: `Couldn't unlike the geotag: ${e.message}`});
    }
  }

  async getPostComments(req, res) {
    let Comment = this.bookshelf.model('Comment');
    let q = Comment.forge()
      .query(qb => {
        qb
          .where('post_id', '=', req.params.id)
          .orderBy('created_at', 'asc')
      });

    let comments = await q.fetchAll({require: false, withRelated: ['user']});

    res.send(comments);
  }

  async postComment(req, res) {
    let Comment = this.bookshelf.model('Comment');
    let Post = this.bookshelf.model('Post');


    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    try {
      await Post.where({id: req.params.id}).fetch({require: true});
    } catch (e) {
      res.sendStatus(404);
      return;
    }

    if(!('text' in req.body)) {
      res.status(400);
      res.send({error: 'Comment text cannot be empty'});
      return;
    }

    let comment_text = req.body.text.trim();

    let comment_object = new Comment({
      id: uuid.v4(),
      post_id: req.params.id,
      user_id: req.session.user,
      text: comment_text
    });

    try {
      await comment_object.save(null, {method: 'insert'});
      await this.getPostComments(req, res);
    } catch (e) {
      res.status(500);
      res.send({error: e.message});
    }
  }

  async editComment(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    let Comment = this.bookshelf.model('Comment');

    let comment_object;

    try {
      comment_object = await Comment.where({ id: req.params.comment_id,post_id: req.params.id }).fetch({require: true});
    } catch(e) {
      res.status(404);
      res.send({error: e.message});
      return
    }

    if(comment_object.get('user_id') != req.session.user)  {
      res.status(403);
    }

    let comment_text;

    if(!('text' in req.body) || req.body.text.trim().length === 0) {
      res.status(400);
      res.send({error: 'Comment text cannot be empty'});
      return;
    }

    comment_text = req.body.text.trim();

    comment_object.set('text', comment_text);
    comment_object.set('updated_at', new Date().toJSON());

    await comment_object.save(null, {method: 'update'});
    await this.getPostComments(req, res);
  }

  async removeComment(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403);
      res.send({error: 'You are not authorized'});
      return;
    }

    if (!('id' in req.params) || !('comment_id' in req.params)) {
      res.status(400);
      res.send({error: '"id" parameter is not given'});
      return;
    }

    let Comment = this.bookshelf.model('Comment');

    try {
      let comment_object = await Comment.where({ id: req.params.comment_id, post_id: req.params.id }).fetch({require: true});

      if (comment_object.get('user_id') != req.session.user) {
        res.status(403);
        res.send({error: 'You are not authorized'});
        return;
      }

      await comment_object.destroy();
    } catch(e) {
      res.status(500);
      res.send({error: e.message});
      return;
    }

    await this.getPostComments(req, res);
  }

  async countComments(posts) {
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
  }
}
