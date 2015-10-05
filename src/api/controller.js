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
    let response = await posts.fetch({require: false, withRelated: ['user']});

    res.send(response.toJSON());
  }

  async userPosts(req, res) {
    let Post = this.bookshelf.model('Post');

    let q = Post.forge()
      .query(qb => {
        qb
          .join('users', 'users.id', 'posts.user_id')
          .where('users.username', '=', req.params.user)  // followed posts
          .orderBy('posts.created_at', 'desc')
      });

    let posts = await q.fetchAll({require: false})

    res.send(posts.toJSON());
  }

  async getPost(req, res) {
    let Post = this.bookshelf.model('Post');

    try {
      let post = await Post.where({id: req.params.id}).fetch({require: true, withRelated: ['user']});
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

    let posts = await q.fetchAll({require: false, withRelated: ['user','user.followers']})

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
      res.send(obj.toJSON());
      return
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

    user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['following']});

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

    if (!('text' in req.body)) {
      res.status(400)
      res.send({error: '"text" parameter is not given'})
    }

    let Post = this.bookshelf.model('Post');

    let obj;
    let store_method = 'insert';

    if('uuid' in req.body) {
      obj = await Post.where({ id: req.body.uuid, user_id: req.session.user }).fetch({require: false});
    }

    if(_.isEmpty(obj)) {
      obj = new Post({
        id: uuid.v4(),
        text: req.body.text,
        user_id: req.session.user
      });
    } else {
      obj.set('text', req.body.text);
      store_method = 'update';
    }


    try {
      console.log(store_method);
      await obj.save(null, {method: store_method});
      await obj.fetch({require: true, withRelated: ['user']})

      res.send(obj.toJSON());
    } catch (e) {
      res.status(500);
      res.send({error: e.message})
    }
  }

  async getUser(req, res) {
    let User = this.bookshelf.model('User');
    let u = await User.where({username: req.params.username}).fetch({require: true, withRelated: ['following']});

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
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['following']});
      let follow = await User.where({username: req.params.username}).fetch({require: true});

      if (user.id != follow.id && _.isUndefined(user.related('following').find({id: follow.id}))) {
        await user.following().attach(follow);

        follow_status.success = true;
        user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['following']});
      }

      follow_status.user = user.toJSON();
    } catch(ex) {
      res.status(500);
      follow_status.error = ex.message;
    }

    res.send(follow_status)
  }

  async unfollowUser(req, res) {
    if (!req.session || !req.session.user) {
      res.status(403)
      res.send({error: 'You are not authorized'})
    }

    let User = this.bookshelf.model('User');
    let follow_status = { success: false };

    try {
      let user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['following']});
      let follow = await User.where({username: req.params.username}).fetch({require: true});

      if (user.id != follow.id && !_.isUndefined(user.related('following').find({id: follow.id}))) {
        await user.following().detach(follow);

        follow_status.success = true;
        user = await User.where({id: req.session.user}).fetch({require: true, withRelated: ['following']});
      }

      follow_status.user = user.toJSON();
    } catch(ex) {
      res.status(500);
      follow_status.error = ex.message;
    }

    res.send(follow_status)
  }
}
