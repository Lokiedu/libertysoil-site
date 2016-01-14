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
import fileType from 'file-type';
import mime from 'mime';
import bb from 'bluebird';
import bcrypt from 'bcrypt';
import crypto from 'crypto'

import { uploadAttachment, downloadAttachment, generateName } from '../../utils/attachments';


let bcryptAsync = bb.promisifyAll(bcrypt);

export default function initBookshelf(config) {
  let knex = Knex(config);
  let bookshelf = Bookshelf(knex);

  bookshelf.plugin('registry');
  bookshelf.plugin('visibility');
  bookshelf.plugin('virtuals');

  let User, Post, Label, School, Country, City, Attachment, Geotag;

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
    followed_labels: function () {
      return this.belongsToMany(Label, 'followed_labels_users', 'user_id', 'label_id');
    },
    followed_schools: function () {
      return this.belongsToMany(School, 'followed_schools_users', 'user_id', 'school_id');
    },
    virtuals: {
      gravatarHash: function() {
        return md5(this.get('email'));
      }
    },
    hidden: ['hashed_password', 'email', 'email_check_hash', 'reset_password_hash'],  // exclude from json-exports
    followLabel: async function(labelId) {
      await this.followed_labels().detach(labelId);
      return this.followed_labels().attach(labelId);
    },
    unfollowLabel: async function(labelId) {
      return this.followed_labels().detach(labelId);
    },
    followSchool: async function(schoolId) {
      await this.followed_schools().detach(schoolId);
      return this.followed_schools().attach(schoolId);
    },
    unfollowSchool: async function(schoolId) {
      return this.followed_schools().detach(schoolId);
    }
  });

  User.create = async function(username, password, email, moreData) {
    let hashed_password = await bcryptAsync.hashAsync(password, 10);

    let random = Math.random().toString();
    let email_check_hash = crypto.createHash('sha1').update(email + random).digest('hex');

    let obj = new User({
      id: uuid.v4(),
      username,
      hashed_password,
      email,
      email_check_hash
    });

    if (!_.isEmpty(moreData)) {
      obj.set('more', moreData);
    }

    await obj.save(null, {method: 'insert'});

    return obj;
  };

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
    geotags: function() {
      return this.belongsToMany(Geotag, 'geotags_posts', 'post_id', 'geotag_id');
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
    },
    /**
     * Attaches geotags by ids.
     * @param {Array} geotagIds
     */
    attachGeotags: async function(geotagIds) {
      await this.geotags().attach(geotagIds);
    },
    /**
     * Attaches new geotags and detaches unneeded.
     * @param {Array} geotagIds
     */
    updateGeotags: async function(geotagIds) {
      let relatedGeotagsIds = (await this.related('geotags').fetch()).pluck('id');
      let geotagsToDetach = _.difference(relatedGeotagsIds, geotagIds);
      let geotagsToAttach = _.difference(geotagIds, relatedGeotagsIds);

      await this.geotags().detach(geotagsToDetach);
      await this.geotags().attach(geotagsToAttach);
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
    },
    images: function() {
      return this.belongsToMany(Attachment, 'images_schools', 'school_id', 'image_id')
    },
    updateImages: async function(imageIds) {
      let relatedImageIds = (await this.related('images').fetch()).pluck('id');
      let imagesToDetach = _.difference(relatedImageIds, imageIds);
      let imagesToAttach = _.difference(imageIds, relatedImageIds);

      await this.images().detach(imagesToDetach);
      await this.images().attach(imagesToAttach);
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
    },
    geotags: function() {
      return this.hasMany(Geotag);
    }
  });

  City = bookshelf.Model.extend({
    tableName: 'geonames_cities',
    posts: function() {
      return this.belongsToMany(Post, 'posts_cities', 'city_id', 'post_id');
    },
    geotags: function() {
      return this.hasOne(Geotag);
    }
  });

  Geotag = bookshelf.Model.extend({
    tableName: 'geotags',
    country: function() {
      return this.belongsTo(Country);
    },
    city: function() {
      return this.belongsTo(City);
    }
  });

  Attachment = bookshelf.Model.extend({
    tableName: 'attachments',
    user: function() {
      return this.belongsTo(User);
    },
    original: function() {
      return this.belongsTo(Attachment, 'original_id');
    },
    download: async function() {
      return downloadAttachment(this.attributes.s3_filename);
    },
    extension: function() {
      if (this.attributes.mime_type) {
        return mime.extension(this.attributes.mime_type);
      }
    },
    reupload: async function(fileName, fileData) {
      let generatedName = generateName(fileName);
      let typeInfo = fileType(fileData);

      if (!typeInfo) {
        throw new Error('Unrecognized file type');
      }

      let response = await uploadAttachment(generatedName, fileData, typeInfo.mime);

      return this.save({
        s3_url: response.Location,
        s3_filename: generatedName,
        filename: fileName,
        size: fileData.length,
        mime_type: typeInfo.mime
      });
    }
  });

  /**
   * Uploads the file to s3 and creates an attachment.
   * @param {String} fileName
   * @param {Buffer} fileData
   * @param {Object} attributes - Additional attributes
   * @returns {Promise}
   */
  Attachment.create = async function create(fileName, fileData, attributes = {}) {
    let attachment = Attachment.forge();
    let generatedName = generateName(fileName);
    let typeInfo = fileType(fileData);

    if (!typeInfo) {
      throw new Error('Unrecognized file type');
    }

    let response = await uploadAttachment(generatedName, fileData, typeInfo.mime);

    return await attachment.save({
      ...attributes,
      s3_url: response.Location,
      s3_filename: generatedName,
      filename: fileName,
      size: fileData.length,
      mime_type: typeInfo.mime
    });
  };

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
  bookshelf.model('Attachment', Attachment);
  bookshelf.model('Geotag', Geotag);
  bookshelf.collection('Posts', Posts);

  return bookshelf;
}
