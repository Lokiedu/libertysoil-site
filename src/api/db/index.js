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
import { promisify, promisifyAll } from 'bluebird';
import { hash as bcryptHash } from 'bcrypt';
import crypto from 'crypto'
import { break as breakGraphemes } from 'grapheme-breaker';
import { OnigRegExp } from 'oniguruma';

import { uploadAttachment, downloadAttachment, generateName } from '../../utils/attachments';


const bcryptHashAsync = promisify(bcryptHash);
promisifyAll(OnigRegExp.prototype)

export function initBookshelfFromKnex(knex) {
  const bookshelf = Bookshelf(knex);

  bookshelf.plugin('registry');
  bookshelf.plugin('visibility');
  bookshelf.plugin('virtuals');

  //let User, Post, Hashtag, School, Country, AdminDivision1, City, Attachment, Geotag, Comment, Quote;

  const User = bookshelf.Model.extend({
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
    ignored_users: function() {
      return this.belongsToMany(User, 'ignored_users', 'user_id', 'ignored_user_id');
    },
    liked_posts: function() {
      return this.belongsToMany(Post, 'likes', 'user_id', 'post_id');
    },
    liked_hashtags: function() {
      return this.belongsToMany(Hashtag, 'liked_hashtags', 'user_id', 'hashtag_id');
    },
    liked_schools: function() {
      return this.belongsToMany(School, 'liked_schools', 'user_id', 'school_id');
    },
    liked_geotags: function() {
      return this.belongsToMany(Geotag, 'liked_geotags', 'user_id', 'geotag_id');
    },
    favourited_posts: function() {
      return this.belongsToMany(Post, 'favourites', 'user_id', 'post_id');
    },
    followed_hashtags: function () {
      return this.belongsToMany(Hashtag, 'followed_hashtags_users', 'user_id', 'hashtag_id');
    },
    followed_schools: function () {
      return this.belongsToMany(School, 'followed_schools_users', 'user_id', 'school_id');
    },
    followed_geotags: function() {
      return this.belongsToMany(Geotag, 'followed_geotags_users', 'user_id', 'geotag_id');
    },
    virtuals: {
      gravatarHash: function() {
        return md5(this.get('email'));
      },
      fullName: function() {
        const more = this.get('more');

        if (more && 'firstName' in more && 'lastName' in more) {
          return `${more.firstName} ${more.lastName}`;
        }

        return this.get('username');
      }
    },
    hidden: ['hashed_password', 'email', 'email_check_hash', 'reset_password_hash', 'fullName'],  // exclude from json-exports
    ignoreUser: async function(userId) {
      // `this` must have ignored_users fetched. Use `fetch({withRelated: ['ignored_users']})`.

      if (
        this.id != userId &&
        _.isUndefined(this.related('ignored_users').find({ id: userId }))
      ) {
        await this.ignored_users().attach(userId);
      }
    },
    followHashtag: async function(hashtagId) {
      await this.followed_hashtags().detach(hashtagId);
      return this.followed_hashtags().attach(hashtagId);
    },
    unfollowHashtag: async function(hashtagId) {
      return this.followed_hashtags().detach(hashtagId);
    },
    followSchool: async function(schoolId) {
      await this.followed_schools().detach(schoolId);
      return this.followed_schools().attach(schoolId);
    },
    unfollowSchool: async function(schoolId) {
      return this.followed_schools().detach(schoolId);
    },
    followGeotag: async function(geotagId) {
      await this.followed_geotags().detach(geotagId);
      return this.followed_geotags().attach(geotagId);
    },
    unfollowGeotag: async function(geotagId) {
      return this.followed_geotags().detach(geotagId);
    }
  });

  User.create = async function(username, password, email, moreData) {
    username = username.toLowerCase();
    const hashed_password = await bcryptHashAsync(password, 10);

    const random = Math.random().toString();
    const email_check_hash = crypto.createHash('sha1').update(email + random).digest('hex');

    const obj = new User({
      id: uuid.v4(),
      username,
      hashed_password,
      email,
      email_check_hash
    });

    if (!_.isEmpty(moreData)) {
      obj.set('more', moreData);
    }

    await obj.save(null, { method: 'insert' });

    return obj;
  };

  const Post = bookshelf.Model.extend({
    tableName: 'posts',
    user: function() {
      return this.belongsTo(User, 'user_id');
    },
    hashtags: function() {
      return this.belongsToMany(Hashtag, 'hashtags_posts', 'post_id', 'hashtag_id');
    },
    schools: function() {
      return this.belongsToMany(School, 'posts_schools', 'post_id', 'school_id');
    },
    geotags: function() {
      return this.belongsToMany(Geotag, 'geotags_posts', 'post_id', 'geotag_id');
    },
    liked_hashtag: function() {
      return this.belongsTo(Hashtag, 'liked_hashtag_id');
    },
    liked_school: function() {
      return this.belongsTo(School, 'liked_school_id');
    },
    liked_geotag: function() {
      return this.belongsTo(Geotag, 'liked_geotag_id');
    },
    likers: function() {
      return this.belongsToMany(User, 'likes', 'post_id', 'user_id');
    },
    favourers: function() {
      return this.belongsToMany(User, 'favourites', 'post_id', 'user_id');
    },
    post_comments: function() {
      return this.hasMany(Comment);
    },
    attachHashtags: async function(names, removeUnused=false) {
      const hashtags = this.hashtags();

      const hashtagsToRemove = [];
      const hashtagNamesToKeep = [];

      (await hashtags.fetch()).map(hashtag => {
        const name = hashtag.get('name');

        if (names.indexOf(name) == -1) {
          hashtagsToRemove.push(hashtag);
        } else {
          hashtagNamesToKeep.push(name);
        }
      });

      const hashtagNamesToAdd = [];
      for (const name of names) {
        if (hashtagNamesToKeep.indexOf(name) == -1) {
          hashtagNamesToAdd.push(name);
        }
      }

      const tags = await Promise.all(hashtagNamesToAdd.map(tag_name => Hashtag.createOrSelect(tag_name)));
      let promises = tags.map(async (tag) => {
        await hashtags.attach(tag)
      });

      if (removeUnused) {
        const morePromises = hashtagsToRemove.map(async (tag) => {
          await hashtags.detach(tag);
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
      const schoolsToAdd = await School.collection().query(qb => {
        qb.whereIn('name', names);
      }).fetch();

      const attachPromise = this.schools().attach(schoolsToAdd.pluck('id'));

      const updatedAtPromise = knex('schools')
        .whereIn('name', names)
        .update({ updated_at: new Date().toJSON() });

      return Promise.all([
        attachPromise,
        updatedAtPromise
      ]);
    },
    /**
     * Attaches schools, checking if a school is already attached,
     * and detaches schools that are not in names.
     * @param {Array} names
     */
    updateSchools: async function(names) {
      const schools = this.schools();
      const relatedSchools = await this.related('schools').fetch();

      const schoolsToDetach = await School.collection().query(qb => {
        qb
          .innerJoin('posts_schools', 'schools.id', 'posts_schools.school_id')
          .whereNotIn('schools.name', names)
          .where('posts_schools.post_id', this.id);
      }).fetch();

      const schoolNamesToAdd = _.difference(names, relatedSchools.pluck('name'));

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
      const relatedGeotagsIds = (await this.related('geotags').fetch()).pluck('id');
      const geotagsToDetach = _.difference(relatedGeotagsIds, geotagIds);
      const geotagsToAttach = _.difference(geotagIds, relatedGeotagsIds);

      await this.geotags().detach(geotagsToDetach);
      await this.geotags().attach(geotagsToAttach);
    }
  });

  Post.typesWithoutPages = ['geotag_like', 'school_like', 'hashtag_like'];
  Post.titleFromText = async (text, authorName) => {
    const get50 = async (text) => {
      const first50GraphemesOfText = breakGraphemes(text).slice(0, 51);

      if (first50GraphemesOfText.length < 50) {
        return first50GraphemesOfText.join('').trim();
      }

      const spaceRegex = new OnigRegExp('\\s');

      if (await spaceRegex.testAsync(first50GraphemesOfText[50])) {
        return first50GraphemesOfText.join('').trim();
      }

      const first50GraphemesOfTextString = first50GraphemesOfText.join('');

      const lastWordRegex = new OnigRegExp('\\W\\w+$');
      const match = await lastWordRegex.searchAsync(first50GraphemesOfTextString);

      if (match === null) {
        return '- no title -';
      }

      return first50GraphemesOfText.slice(0, match[0].start).join('').trim();
    };

    const first50GraphemesOfText = await get50(text);

    return `${authorName}: ${first50GraphemesOfText}`;
  };

  const Hashtag = bookshelf.Model.extend({
    tableName: 'hashtags',
    posts: function() {
      return this.belongsToMany(Post, 'hashtags_posts', 'hashtag_id', 'post_id');
    }
  });

  Hashtag.createOrSelect = async (name) => {
    try {
      return await Hashtag.where({ name }).fetch({ require: true });
    } catch (e) {
      const hashtag = new Hashtag({
        id: uuid.v4(),
        name
      });

      await hashtag.save(null, { method: 'insert' });
      return hashtag
    }
  };

  const School = bookshelf.Model.extend({
    tableName: 'schools',
    posts: function() {
      return this.belongsToMany(Post, 'posts_schools', 'school_id', 'post_id');
    },
    images: function() {
      return this.belongsToMany(Attachment, 'images_schools', 'school_id', 'image_id')
    },
    updateImages: async function(imageIds) {
      const relatedImageIds = (await this.related('images').fetch()).pluck('id');
      const imagesToDetach = _.difference(relatedImageIds, imageIds);
      const imagesToAttach = _.difference(imageIds, relatedImageIds);

      await this.images().detach(imagesToDetach);
      await this.images().attach(imagesToAttach);
    }
  });

  School.createOrSelect = async (name) => {
    try {
      return await School.where({ name }).fetch({ require: true });
    } catch (e) {
      const school = new School({
        id: uuid.v4(),
        name
      });

      await school.save(null, { method: 'insert' });
      return school;
    }
  };

  const Country = bookshelf.Model.extend({
    tableName: 'geonames_countries',
    posts: function() {
      return this.belongsToMany(Post, 'posts_countries', 'country_id', 'post_id');
    },
    geotags: function() {
      return this.hasMany(Geotag);
    }
  });

  const AdminDivision1 = bookshelf.Model.extend({
    tableName: 'geonames_admin1',
    geotags: function() {
      return this.hasMany(Geotag);
    }
  });

  const City = bookshelf.Model.extend({
    tableName: 'geonames_cities',
    posts: function() {
      return this.belongsToMany(Post, 'posts_cities', 'city_id', 'post_id');
    },
    geotags: function() {
      return this.hasOne(Geotag);
    }
  });

  const Geotag = bookshelf.Model.extend({
    tableName: 'geotags',
    geonames_country: function() {
      return this.belongsTo(Country, 'geonames_country_id');
    },
    geonames_admin1: function() {
      return this.belongsTo(AdminDivision1, 'geonames_admin1_id');
    },
    geonames_city: function() {
      return this.belongsTo(City, 'geonames_city_id');
    },
    country: function() {
      return this.belongsTo(Geotag, 'country_id');
    },
    admin1: function() {
      return this.belongsTo(Geotag, 'admin1_id');
    },
    city: function() {
      return this.belongsTo(Geotag, 'city_id');
    },
    continent: function() {
      return this.belongsTo(Geotag, 'continent_id');
    }
  });

  const Attachment = bookshelf.Model.extend({
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
      if (!this.attributes.mime_type) {
        return '';
      }

      return mime.extension(this.attributes.mime_type);
    },
    reupload: async function(fileName, fileData) {
      const generatedName = generateName(fileName);
      const typeInfo = fileType(fileData);

      if (!typeInfo) {
        throw new Error('Unrecognized file type');
      }

      const response = await uploadAttachment(generatedName, fileData, typeInfo.mime);

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
    const attachment = Attachment.forge();
    const generatedName = generateName(fileName);
    const typeInfo = fileType(fileData);

    if (!typeInfo) {
      throw new Error('Unrecognized file type');
    }

    const response = await uploadAttachment(generatedName, fileData, typeInfo.mime);

    return await attachment.save({
      ...attributes,
      s3_url: response.Location,
      s3_filename: generatedName,
      filename: fileName,
      size: fileData.length,
      mime_type: typeInfo.mime
    });
  };

  const Comment = bookshelf.Model.extend({
    tableName: 'comments',
    user: function() {
      return this.belongsTo(User);
    },
    post: function() {
      return this.belongsTo(Post);
    }
  });

  const Quote = bookshelf.Model.extend({
    tableName: 'quotes'
  });

  const Posts = bookshelf.Collection.extend({
    model: Post
  });

  // adding to registry
  bookshelf.model('User', User);
  bookshelf.model('Post', Post);
  bookshelf.model('Hashtag', Hashtag);
  bookshelf.model('School', School);
  bookshelf.model('Country', Country);
  bookshelf.model('AdminDivision1', AdminDivision1);
  bookshelf.model('City', City);
  bookshelf.model('Attachment', Attachment);
  bookshelf.model('Geotag', Geotag);
  bookshelf.model('Comment', Comment);
  bookshelf.model('Quote', Quote);
  bookshelf.collection('Posts', Posts);

  return bookshelf;
}

export default function initBookshelf(config) {
  const knex = Knex(config);
  return initBookshelfFromKnex(knex);
}
