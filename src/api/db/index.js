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
import md5 from 'md5';
import Knex from 'knex';
import Bookshelf from 'bookshelf';
import uuid from 'uuid'

export default function initBookshelf(config) {
  let knex = Knex(config);
  let bookshelf = Bookshelf(knex);

  bookshelf.plugin('registry');
  bookshelf.plugin('visibility');
  bookshelf.plugin('virtuals');

  let User, Post, Label;

  User = bookshelf.Model.extend({
    tableName: 'users',
    posts: function() {
      return this.hasMany(Post, 'user_id');
    },
    following: function() {
      return this.belongsToMany(User, 'followers', 'user_id', 'following_user_id');
    },
    followers: function() {
      return this.belongsToMany(User, 'followers', 'following_user_id', 'user_id');
    },
    liked_posts: function() {
      return this.belongsToMany(User, 'likes', 'user_id', 'post_id');
    },
    favourited_posts: function() {
      return this.belongsToMany(User, 'favourites', 'user_id', 'post_id');
    },
    virtuals: {
      gravatarHash: function() {
        return md5(this.get('email'));
      }
    },
    hidden: ['hashed_password', 'email']  // exclude from json-exports
  });

  Post = bookshelf.Model.extend({
    tableName: 'posts',
    user: function() {
      return this.belongsTo(User, 'user_id');
    },
    labels: function() {
      return this.belongsToMany(Label, 'labels_posts', 'post_id', 'label_id');
    },
    likers: function() {
      return this.belongsToMany(User, 'likes', 'post_id', 'user_id');
    },
    favourers: function() {
      return this.belongsToMany(User, 'favourites', 'post_id', 'user_id');
    },
    attachLabels: async function(names) {
      let labels = this.labels();

      let tags = await Promise.all(names.map(tag_name => Label.createOrSelect(tag_name)));
      let attachPromises = tags.map(async (tag) => {
        labels.attach(tag)
      });

      await Promise.all(attachPromises);
    }
  });

  Label = bookshelf.Model.extend({
    tableName: 'labels',
    posts: function() {
      return this.belongsToMany(Post, 'labels_posts', 'label_id', 'post_id');
    }
  });

  Label.createOrSelect = async (name) => {
    try {
      return await Label.where({ name }).fetch({require: true});
    } catch (e) {
      let label = new Label({
        id: uuid.v4(),
        name
      });

      await label.save(null, {method: 'insert'});
      return label
    }
  };

  let Posts;

  Posts = bookshelf.Collection.extend({
    model: Post
  });

  // adding to registry
  bookshelf.model('User', User);
  bookshelf.model('Post', Post);
  bookshelf.model('Label', Label);
  bookshelf.collection('Posts', Posts);

  return bookshelf;
}
