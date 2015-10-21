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
    let response = await posts.fetch({require: false, withRelated: ['user', 'likers', 'favourers', 'labels']});

    res.send(response.toJSON());
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

    let posts = await q.fetchAll({require: false, withRelated: ['user', 'likers', 'favourers', 'labels']})

    res.send(posts.toJSON());
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

    let posts = await q.fetchAll({require: false, withRelated: ['user', 'likers', 'favourers', 'labels']})

    res.send(posts.toJSON());
  }

  async getPost(req, res) {
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: req.params.id}).fetch({require: true, withRelated: ['user', 'likers', 'favourers', 'labels']});
      res.send(post.toJSON());
    } catch (e) {
      res.sendStatus(404)
    }
  }

  async likePost(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
    }

    let result = { success: false };

    let User = this.bookshelf.model('User');
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: req.params.id}).fetch({require: true});
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['liked_posts']});

      await user.liked_posts().attach(post);

      let likes = await this.bookshelf.knex
        .select('post_id')
        .from('likes')
        .where({user_id: req.session.user});

      result.success = true;
      result.likes = likes.map(row => row.post_id)
    } catch (ex) {
      res.status(500);
      result.error = ex.message;
    }

    res.send(result)
  }

  async unlikePost(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
    }

    let result = { success: false };

    let User = this.bookshelf.model('User');
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: req.params.id}).fetch({require: true});
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['liked_posts']});

      await user.liked_posts().detach(post);

      let likes = await this.bookshelf.knex
        .select('post_id')
        .from('likes')
        .where({user_id: req.session.user});

      result.success = true;
      result.likes = likes.map(row => row.post_id)
    } catch (ex) {
      res.status(500);
      result.error = ex.message;
    }

    res.send(result)
  }

  async favPost(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
    }

    let result = { success: false };

    let User = this.bookshelf.model('User');
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: req.params.id}).fetch({require: true});
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['favourited_posts']});

      await user.favourited_posts().attach(post);

      let favs = await this.bookshelf.knex
        .select('post_id')
        .from('favourites')
        .where({user_id: req.session.user});

      result.success = true;
      result.favourites = favs.map(row => row.post_id)
    } catch (ex) {
      res.status(500);
      result.error = ex.message;
    }

    res.send(result)
  }

  async unfavPost(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
    }

    let result = { success: false };

    let User = this.bookshelf.model('User');
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: req.params.id}).fetch({require: true});
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['favourited_posts']});

      await user.favourited_posts().detach(post);

      let favs = await this.bookshelf.knex
        .select('post_id')
        .from('favourites')
        .where({user_id: req.session.user});

      result.success = true;
      result.favourites = favs.map(row => row.post_id)
    } catch (ex) {
      res.status(500);
      result.error = ex.message;
    }

    res.send(result)
  }

  async subscriptions(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
      return
    }

    let uid = req.session.user
    let Post = this.bookshelf.model('Post');

    let q = Post.forge()
      .query(qb => {
        qb
          .leftJoin('followers', 'followers.following_user_id', 'posts.user_id')
          .where('followers.user_id', '=', uid)  // followed posts
          .orWhere('posts.user_id', '=', uid)    // own posts
          .orderBy('posts.created_at', 'desc')
      })

    let posts = await q.fetchAll({require: false, withRelated: ['user', 'user.followers', 'likers', 'favourers', 'labels']})

    res.send(posts.toJSON());
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

    let User = this.bookshelf.model('User');

    {
      let check = await User.where({username: req.body.username}).fetch({require: false})
      if (check) {
        res.status(409);
        res.send({error: 'User with this username is already registered'})
        return;
      }
    }

    {
      let check = await User.where({email: req.body.email}).fetch({require: false})
      if (check) {
        res.status(409);
        res.send({error: 'User with this email is already registered'})
        return;
      }
    }

    let hashedPassword = await bcryptAsync.hashAsync(req.body.password, 10);
    let obj = new User({
      id: uuid.v4(),
      username: req.body.username,
      hashed_password: hashedPassword,
      email: req.body.email
    });

    let moreData = {};
    for (let fieldName of optionalFields) {
      if (fieldName in req.body) {
        moreData[fieldName] = req.body[fieldName];
      }
    }

    if (!_.isEmpty(moreData)) {
      obj.set('more', moreData);
    }

    try {
      await obj.save(null, {method: 'insert'});

      if (req.session) {
        req.session.user = obj.id;
      }

      res.send(obj.toJSON());


      return;
    } catch (e) {
      if (e.code == 23505) {
        res.status(401)
        res.send({error: 'User already exists'})
        return
      } else {
        console.dir(e)

        res.status(500);
        res.send({error: e.message})
        return
      }
    }
  }

  async login(req, res) {
    let requiredFields = ['username', 'password'];

    for (let fieldName of requiredFields) {
      if (!(fieldName in req.body)) {
        res.status(400);
        res.send({error: 'Bad Request'});
        return
      }
    }

    let User = this.bookshelf.model('User');

    let user

    try {
      user = await new User({username: req.body.username}).fetch({require: true});
    } catch (e) {
      console.log(`user '${req.body.username}' is not found`)
      res.status(401)
      res.send({success: false})
      return
    }

    let passwordIsValid = await bcryptAsync.compareAsync(req.body.password, user.get('hashed_password'));

    if (!passwordIsValid) {
      console.log(`password for user '${req.body.username}' is not found`)
      res.status(401)
      res.send({success: false})
      return
    }
    if (req.session) {
      req.session.user = user.id;
    }

    user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['following', 'followers', 'likes', 'favourites']});

    res.send({ success: true, user })
  }

  async logout(req, res) {
    if (req.session && req.session.user) {
      req.session.destroy();
    }
    res.redirect('/');
  }

  async whoAmI(req, res) {
  }

  async createPost(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
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
        await obj.attachLabels(tags)
      }

      await obj.fetch({require: true, withRelated: ['user', 'labels', 'likers', 'favourers']});

      res.send(obj.toJSON());
    } catch (e) {
      console.log(e)
      console.log(e.stack)
      res.status(500);
      res.send({error: e.message});
    }
  }

  async updatePost(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
    }

    if (!('id' in req.params)) {
      res.status(400)
      res.send({error: '"id" parameter is not given'});
    }

    let Post = this.bookshelf.model('Post');

    let post_object;

    try {
      post_object = await Post.where({ id: req.params.id, user_id: req.session.user }).fetch({require: true, withRelated: ['labels']});
    } catch(e) {
      res.status(500);
      res.send({error: e.message})
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
        await post_object.attachLabels(tags, true)
      }

      await post_object.fetch({require: true, withRelated: ['user', 'labels', 'likers', 'favourers']})

      res.send(post_object.toJSON());
    } catch (e) {
      console.log(e)
      console.log(e.stack)

      res.status(500);
      res.send({error: e.message})
    }
  }

  async removePost(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
    }

    if (!('id' in req.params)) {
      res.status(400)
      res.send({error: '"id" parameter is not given'});
    }

    let Post = this.bookshelf.model('Post');

    try {
      let post_object = await Post.where({ id: req.params.id, user_id: req.session.user }).fetch({require: true});
      post_object.destroy();
    } catch(e) {
      res.status(500);
      res.send({error: e.message})
    }
    res.status(200);
    res.send({success: true});
  }

  async getUser(req, res) {
    let User = this.bookshelf.model('User');
    let u = await User.where({username: req.params.username}).fetch({require: true, withRelated: ['following', 'followers']});

    res.send(u.toJSON());
  }

  async followUser(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
    }

    let User = this.bookshelf.model('User');
    let follow_status = { success: false };

    try {
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['following', 'followers']});
      let follow = await User.where({username: req.params.username}).fetch({require: true});

      if (user.id != follow.id && _.isUndefined(user.related('following').find({id: follow.id}))) {
        await user.following().attach(follow);

        follow_status.success = true;
        user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['following', 'followers']});
      }

      follow_status.user = user.toJSON();
    } catch(ex) {
      res.status(500);
      follow_status.error = ex.message;
    }

    res.send(follow_status)
  }

  async updateUser(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
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
    } catch(ex) {
      console.log(ex);
      res.status(500);
      res.send({error: 'Update failed'});
    }
  }

  async changePassword(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
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
    } catch(ex) {
      console.log(ex);
      res.status(500);
      res.send({error: 'Update failed'});
    }
  }

  async unfollowUser(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
    }

    let User = this.bookshelf.model('User');
    let follow_status = { success: false };

    try {
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['following', 'followers']});
      let follow = await User.where({username: req.params.username}).fetch({require: true});

      if (user.id != follow.id && !_.isUndefined(user.related('following').find({id: follow.id}))) {
        await user.following().detach(follow);

        follow_status.success = true;
        user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['following', 'followers']});
      }

      follow_status.user = user.toJSON();
    } catch(ex) {
      res.status(500);
      follow_status.error = ex.message;
    }

    res.send(follow_status)
  }
}
