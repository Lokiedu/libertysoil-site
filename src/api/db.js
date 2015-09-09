import Knex from 'knex';
import Bookshelf from 'bookshelf';

export default function initBookshelf(config) {
  let knex = Knex(config);
  let bookshelf = Bookshelf(knex);

  bookshelf.plugin('registry');
  bookshelf.plugin('visibility');

  let User, Post, Following;

  User = bookshelf.Model.extend({
    tableName: 'users',
    posts: function() {
      return this.hasMany(Post, 'user_id');
    },
    following: function() {
      return this.hasMany(Following, 'user_id');
    },
    followers: function() {
      return this.hasMany(Following, 'following_user_id');
    },
    hidden: ['hashed_password', 'email']  // exclude from json-exports
  });

  Following = bookshelf.Model.extend({
    tableName: 'followers',
    user: function() {
      return this.belongsTo(User, 'user_id');
    },
    following: function() {
      return this.hasOne(User, 'following_user_id');
    },
    hidden: ['hashed_password', 'email']  // exclude from json-exports
  });

  Post = bookshelf.Model.extend({
    tableName: 'posts',
    user: function() {
      return this.belongsTo(User, 'user_id');
    }
  });

  let Posts

  Posts = bookshelf.Collection.extend({
    model: Post
  });

  // adding to registry
  bookshelf.model('User', User);
  bookshelf.model('Post', Post);
  bookshelf.model('Following', Following);
  bookshelf.collection('Posts', Posts);

  return bookshelf;
}
