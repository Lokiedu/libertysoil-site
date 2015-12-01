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
import _ from 'lodash'

export default function initBookshelf(config) {
  let knex = Knex(config);
  let bookshelf = Bookshelf(knex);

  bookshelf.plugin('registry');
  bookshelf.plugin('visibility');
  bookshelf.plugin('virtuals');

  let User, Post, Label, School, Country, City;

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
      return this.belongsToMany(Post, 'likes', 'user_id', 'post_id');
    },
    favourited_posts: function() {
      return this.belongsToMany(Post, 'favourites', 'user_id', 'post_id');
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
    schools: function() {
      return this.belongsToMany(School, 'posts_schools', 'post_id', 'school_id');
    },
    countries: function() {
      return this.belongsToMany(Country, 'posts_countries', 'post_id', 'country_id');
    },
    cities: function() {
      return this.belongsToMany(City, 'posts_cities', 'post_id', 'city_id');
    },
    likers: function() {
      return this.belongsToMany(User, 'likes', 'post_id', 'user_id');
    },
    favourers: function() {
      return this.belongsToMany(User, 'favourites', 'post_id', 'user_id');
    },
    attachLabels: async function(names, removeUnused=false) {
      let labels = this.labels();

      let labelsToRemove = [];
      let labelNamesToKeep = [];

      (await labels.fetch()).map(label => {
        let name = label.get('name');

        if (names.indexOf(name) == -1) {
          labelsToRemove.push(label);
        } else {
          labelNamesToKeep.push(name);
        }
      });

      let labelNamesToAdd = [];
      for (let name of names) {
        if (labelNamesToKeep.indexOf(name) == -1) {
          labelNamesToAdd.push(name);
        }
      }

      let tags = await Promise.all(labelNamesToAdd.map(tag_name => Label.createOrSelect(tag_name)));
      let promises = tags.map(async (tag) => {
        await labels.attach(tag)
      });

      if (removeUnused) {
        let morePromises = labelsToRemove.map(async (tag) => {
          await labels.detach(tag);
        });

        promises = [...promises, ...morePromises];
      }

      await Promise.all(promises);
    },
    /**
     * Attaches schools to the post without checking already attached schools.
     * @param {Array} names
     */
    attachSchools: async function(names) {
      let schoolsToAdd = await School.collection().query(qb => {
        qb.whereIn('name', names);
      }).fetch();

      await this.schools().attach(schoolsToAdd.pluck('id'));
    },
    /**
     * Attaches schools, checking if a school is already attached,
     * and detaches schools that are not in names.
     * @param {Array} names
     */
    updateSchools: async function(names) {
      let schools = this.schools();
      let relatedSchools = await this.related('schools').fetch();

      let schoolsToDetach = await School.collection().query(qb => {
        qb
          .innerJoin('posts_schools', 'schools.id', 'posts_schools.school_id')
          .whereNotIn('schools.name', names)
          .where('posts_schools.post_id', this.id);
      }).fetch();

      let schoolNamesToAdd = _.difference(names, relatedSchools.pluck('name'));

      await Promise.all([
        schools.detach(schoolsToDetach.pluck('id')),
        this.attachSchools(schoolNamesToAdd)
      ]);
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

  School = bookshelf.Model.extend({
    tableName: 'schools',
    posts: function() {
      return this.belongsToMany(Post, 'posts_schools', 'school_id', 'post_id');
    }
  });

  School.createOrSelect = async (name) => {
    try {
      return await School.where({ name }).fetch({require: true});
    } catch (e) {
      let school = new School({
        id: uuid.v4(),
        name
      });

      await school.save(null, {method: 'insert'});
      return school;
    }
  };

  Country = bookshelf.Model.extend({
    tableName: 'geonames_countries',
    posts: function() {
      return this.belongsToMany(Post, 'posts_countries', 'country_id', 'post_id');
    }
  });

  City = bookshelf.Model.extend({
    tableName: 'geonames_cities',
    posts: function() {
      return this.belongsToMany(Post, 'posts_cities', 'city_id', 'post_id');
    }
  });

  let Posts;

  Posts = bookshelf.Collection.extend({
    model: Post
  });

  // adding to registry
  bookshelf.model('User', User);
  bookshelf.model('Post', Post);
  bookshelf.model('Label', Label);
  bookshelf.model('School', School);
  bookshelf.model('Country', Country);
  bookshelf.model('City', City);
  bookshelf.collection('Posts', Posts);

  return bookshelf;
}
