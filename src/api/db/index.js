/* eslint object-shorthand: "off" */
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
import crypto from 'crypto';

import md5 from 'md5';
import Knex from 'knex';
import Bookshelf from 'bookshelf';
import uuid from 'uuid';
import _ from 'lodash';
import fileType from 'file-type';
import mime from 'mime';
import { promisify, promisifyAll } from 'bluebird';
import { hash as bcryptHash } from 'bcrypt';
import { break as breakGraphemes } from 'grapheme-breaker';
import { OnigRegExp } from 'oniguruma';
import Checkit from 'checkit';
import MarkdownIt from 'markdown-it';

import { uploadAttachment, downloadAttachment, generateName } from '../../utils/attachments';
import { ProfilePost as ProfilePostValidations } from './validators';


const bcryptHashAsync = promisify(bcryptHash);
promisifyAll(OnigRegExp.prototype);

const postMarkdown = new MarkdownIt();

export function initBookshelfFromKnex(knex) {
  const bookshelf = Bookshelf(knex);

  bookshelf.plugin('registry');
  bookshelf.plugin('visibility');
  bookshelf.plugin('virtuals');

  //let User, Post, Hashtag, School, Country, AdminDivision1, City, Attachment, Geotag, Comment, Quote;

  const User = bookshelf.Model.extend({
    tableName: 'users',
    posts() {
      return this.hasMany(Post, 'user_id');
    },
    profile_posts() {
      return this.hasMany(ProfilePost, 'user_id');
    },
    bookmarks() {
      return this.hasMany(Bookmark, 'user_id');
    },
    following() {
      return this.belongsToMany(User, 'followers', 'user_id', 'following_user_id');
    },
    followers() {
      return this.belongsToMany(User, 'followers', 'following_user_id', 'user_id');
    },
    ignored_users() {
      return this.belongsToMany(User, 'ignored_users', 'user_id', 'ignored_user_id');
    },
    liked_posts() {
      return this.belongsToMany(Post, 'likes', 'user_id', 'post_id');
    },
    liked_hashtags() {
      return this.belongsToMany(Hashtag, 'liked_hashtags', 'user_id', 'hashtag_id');
    },
    liked_schools() {
      return this.belongsToMany(School, 'liked_schools', 'user_id', 'school_id');
    },
    liked_geotags() {
      return this.belongsToMany(Geotag, 'liked_geotags', 'user_id', 'geotag_id');
    },
    favourited_posts() {
      return this.belongsToMany(Post, 'favourites', 'user_id', 'post_id');
    },
    followed_hashtags() {
      return this.belongsToMany(Hashtag, 'followed_hashtags_users', 'user_id', 'hashtag_id');
    },
    followed_schools() {
      return this.belongsToMany(School, 'followed_schools_users', 'user_id', 'school_id');
    },
    followed_geotags() {
      return this.belongsToMany(Geotag, 'followed_geotags_users', 'user_id', 'geotag_id');
    },
    post_subscriptions() {
      return this.belongsToMany(Post, 'post_subscriptions');
    },
    inbox() {
      return this.hasMany(UserMessage, 'reciever_id');
    },
    outbox() {
      return this.hasMany(UserMessage, 'sender_id');
    },
    virtuals: {
      gravatarHash() {
        const email = this.get('email');
        if (!email) {
          return '';
        }
        return md5(email);
      },
      fullName() {
        const more = this.get('more');

        if (more && 'firstName' in more && 'lastName' in more) {
          return `${more.firstName} ${more.lastName}`;
        }

        return this.get('username');
      }
    },
    hidden: ['hashed_password', 'email', 'email_check_hash', 'reset_password_hash', 'fullName'],  // exclude from json-exports
    async ignoreUser(userId) {
      // `this` must have ignored_users fetched. Use `fetch({withRelated: ['ignored_users']})`.

      if (
        this.id != userId &&
        _.isUndefined(this.related('ignored_users').find({ id: userId }))
      ) {
        await this.ignored_users().attach(userId);
      }
    },
    async followHashtag(hashtagId) {
      await this.followed_hashtags().detach(hashtagId);
      return this.followed_hashtags().attach(hashtagId);
    },
    async unfollowHashtag(hashtagId) {
      return this.followed_hashtags().detach(hashtagId);
    },
    async followSchool(schoolId) {
      await this.followed_schools().detach(schoolId);
      return this.followed_schools().attach(schoolId);
    },
    async unfollowSchool(schoolId) {
      return this.followed_schools().detach(schoolId);
    },
    async followGeotag(geotagId) {
      await this.followed_geotags().detach(geotagId);
      return this.followed_geotags().attach(geotagId);
    },
    async unfollowGeotag(geotagId) {
      return this.followed_geotags().detach(geotagId);
    }
  });

  User.create = async function (username, password, email, moreData) {
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
    user() {
      return this.belongsTo(User, 'user_id');
    },
    hashtags() {
      return this.belongsToMany(Hashtag, 'hashtags_posts', 'post_id', 'hashtag_id');
    },
    schools() {
      return this.belongsToMany(School, 'posts_schools', 'post_id', 'school_id');
    },
    geotags() {
      return this.belongsToMany(Geotag, 'geotags_posts', 'post_id', 'geotag_id');
    },
    liked_hashtag() {
      return this.belongsTo(Hashtag, 'liked_hashtag_id');
    },
    liked_school() {
      return this.belongsTo(School, 'liked_school_id');
    },
    liked_geotag() {
      return this.belongsTo(Geotag, 'liked_geotag_id');
    },
    likers() {
      return this.belongsToMany(User, 'likes', 'post_id', 'user_id');
    },
    favourers() {
      return this.belongsToMany(User, 'favourites', 'post_id', 'user_id');
    },
    post_comments() {
      return this.hasMany(Comment);
    },
    subscribers() {
      return this.belongsToMany(User, 'post_subscriptions');
    },

    // Hashtag methods
    async attachHashtags(names) {
      const hashtags = await Promise.all(names.map(name => Hashtag.createOrSelect(name)));
      const hashtagIds = hashtags.map(hashtag => hashtag.id);

      await this.hashtags().attach(hashtagIds);

      await knex('hashtags')
        .whereIn('id', hashtagIds)
        .increment('post_count', 1);

      await Hashtag.updateUpdatedAt(hashtagIds);
    },
    async detachHashtags(names) {
      const hashtagIds = (await Hashtag.collection().query(qb => {
        qb.whereIn('name', names);
      }).fetch()).pluck('id');

      await this.hashtags().detach(hashtagIds);

      await knex('hashtags')
        .whereIn('id', hashtagIds)
        .decrement('post_count', 1);

      await Hashtag.updateUpdatedAt(hashtagIds);
    },
    async updateHashtags(names) {
      const relatedHashtagNames = (await this.related('hashtags').fetch()).pluck('name');
      const hashtagsToAttach = _.difference(names, relatedHashtagNames);
      const hashtagsToDetach = _.difference(relatedHashtagNames, names);

      await Promise.all([
        this.attachHashtags(hashtagsToAttach),
        this.detachHashtags(hashtagsToDetach)
      ]);
    },

    // School methods
    async attachSchools(names) {
      const schools = await School.collection().query(qb => {
        qb.whereIn('name', names);
      }).fetch();
      const schoolIds = schools.pluck('id');

      await this.schools().attach(schoolIds);

      await knex('schools')
        .whereIn('id', schoolIds)
        .increment('post_count', 1);

      await School.updateUpdatedAt(schoolIds);
    },
    async detachSchools(names) {
      const schoolIds = (await School.collection().query(qb => {
        qb.whereIn('name', names);
      }).fetch()).pluck('id');

      await this.schools().detach(schoolIds);

      await knex('schools')
        .whereIn('id', schoolIds)
        .decrement('post_count', 1);

      await School.updateUpdatedAt(schoolIds);
    },
    async updateSchools(names) {
      const relatedSchoolNames = (await this.related('schools').fetch()).pluck('name');
      const schoolsToAttach = _.difference(names, relatedSchoolNames);
      const schoolsToDetach = _.difference(relatedSchoolNames, names);

      await Promise.all([
        this.attachSchools(schoolsToAttach),
        this.detachSchools(schoolsToDetach)
      ]);
    },

    // Geotag methods
    async attachGeotags(geotagIds) {
      await this.geotags().attach(geotagIds);

      await knex('geotags')
        .whereIn('id', geotagIds)
        .increment('post_count', 1);

      // Update post counters for all tags in the hierarchy
      // (Continent -> Country -> Admin Division -> City)
      // Get all parent ids
      const geotags = await knex('geotags')
        .select(['country_id', 'admin1_id', 'continent_id'])
        .whereIn('id', geotagIds);
      const geotagIdsToIncrement = _.union(_.flatten(geotags.map(_.values)), geotagIds).filter(t => !!t);
      await knex('geotags')
        .whereIn('id', geotagIdsToIncrement)
        .increment('hierarchy_post_count', 1);

      await Geotag.updateUpdatedAt(geotagIds);
    },
    async detachGeotags(geotagIds) {
      await this.geotags().detach(geotagIds);

      await knex('geotags')
        .whereIn('id', geotagIds)
        .decrement('post_count', 1);

      const geotags = await knex('geotags')
        .select(['country_id', 'admin1_id', 'continent_id'])
        .whereIn('id', geotagIds);
      const geotagIdsToDecrement = _.union(_.flatten(geotags.map(_.values)), geotagIds).filter(t => !!t);
      await knex('geotags')
        .whereIn('id', geotagIdsToDecrement)
        .decrement('hierarchy_post_count', 1);

      await Geotag.updateUpdatedAt(geotagIds);
    },
    async updateGeotags(geotagIds) {
      const relatedGeotagsIds = (await this.related('geotags').fetch()).pluck('id');
      const geotagsToAttach = _.difference(geotagIds, relatedGeotagsIds);
      const geotagsToDetach = _.difference(relatedGeotagsIds, geotagIds);

      await Promise.all([
        this.attachGeotags(geotagsToAttach),
        this.detachGeotags(geotagsToDetach)
      ]);
    },

    /**
     * Detach all attached tags from a post and decrements post counters.
     * Call before destroing a post.
     */
    async detachAllTags() {
      return Promise.all([
        this.updateHashtags([]),
        this.updateSchools([]),
        this.updateGeotags([])
      ]);
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
    posts() {
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
      return hashtag;
    }
  };

  Hashtag.updatePostCounters = async function () {
    await knex('hashtags')
      .update({
        post_count: knex('hashtags_posts')
          .where('hashtags_posts.hashtag_id', knex.raw('hashtags.id'))
          .count()
      });
  };

  Hashtag.updateUpdatedAt = async function (ids) {
    await knex('hashtags')
      .whereIn('id', ids)
      .update({
        updated_at: knex('hashtags_posts')
          .select('created_at')
          .where('hashtags_posts.hashtag_id', knex.raw('hashtags.id'))
          .orderBy('created_at', 'DESC')
          .limit(1)
      });
  };

  const School = bookshelf.Model.extend({
    tableName: 'schools',
    posts() {
      return this.belongsToMany(Post, 'posts_schools', 'school_id', 'post_id');
    },
    images() {
      return this.belongsToMany(Attachment, 'images_schools', 'school_id', 'image_id');
    },
    async updateImages(imageIds) {
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

  School.updatePostCounters = async function () {
    await knex('schools')
      .update({
        post_count: knex('posts_schools')
          .where('posts_schools.school_id', knex.raw('schools.id'))
          .count()
      });
  };

  School.updateUpdatedAt = async function (ids) {
    await knex('schools')
      .whereIn('id', ids)
      .update({
        updated_at: knex('posts_schools')
          .select('created_at')
          .where('posts_schools.school_id', knex.raw('schools.id'))
          .orderBy('created_at', 'DESC')
          .limit(1)
      });
  };

  const Country = bookshelf.Model.extend({
    tableName: 'geonames_countries',
    posts() {
      return this.belongsToMany(Post, 'posts_countries', 'country_id', 'post_id');
    },
    geotags() {
      return this.hasMany(Geotag);
    }
  });

  const AdminDivision1 = bookshelf.Model.extend({
    tableName: 'geonames_admin1',
    geotags() {
      return this.hasMany(Geotag);
    }
  });

  const City = bookshelf.Model.extend({
    tableName: 'geonames_cities',
    posts() {
      return this.belongsToMany(Post, 'posts_cities', 'city_id', 'post_id');
    },
    geotags() {
      return this.hasOne(Geotag);
    }
  });

  const Geotag = bookshelf.Model.extend({
    tableName: 'geotags',
    geonames_country() {
      return this.belongsTo(Country, 'geonames_country_id');
    },
    geonames_admin1() {
      return this.belongsTo(AdminDivision1, 'geonames_admin1_id');
    },
    geonames_city() {
      return this.belongsTo(City, 'geonames_city_id');
    },
    country() {
      return this.belongsTo(Geotag, 'country_id');
    },
    admin1() {
      return this.belongsTo(Geotag, 'admin1_id');
    },
    city() {
      return this.belongsTo(Geotag, 'city_id');
    },
    continent() {
      return this.belongsTo(Geotag, 'continent_id');
    },
    posts() {
      return this.belongsToMany(Post);
    },
    async updateHierarchyPostCount() {
      const foreignKey = Geotag.TYPES[this.get('type')];

      await knex('getoags as parents')
        .where('id', this.id)
        .update({
          hierarchy_post_count: knex
            .select(knex.raw('sum(children.post_count) + parents.post_count'))
            .from(knex.raw('geotags as children'))
            .whereRaw(`children.${foreignKey} = ?`, this.id)
        });
    }
  });

  Geotag.updatePostCounters = async function () {
    async function updateHierarchyPostCount(type, foreignKey) {
      await knex(knex.raw('geotags as parents'))
        .where('type', type)
        .update({
          hierarchy_post_count: knex.raw(`
            coalesce(
              (SELECT sum(children.post_count) + parents.post_count FROM geotags as children
              WHERE children.${foreignKey} = parents.id),
              0
            )
          `)
        });
    }

    // Update post_count first because hierarchy_post_count depends on post_count.
    await knex('geotags')
      .update({
        post_count: knex('geotags_posts')
          .where('geotags_posts.geotag_id', knex.raw('geotags.id'))
          .count()
      });

    await Promise.all([
      updateHierarchyPostCount('Continent', 'continent_id'),
      updateHierarchyPostCount('Country', 'country_id'),
      updateHierarchyPostCount('AdminDivision1', 'admin1_id'),
      knex('geotags').where('type', 'City').update('hierarchy_post_count', knex.raw('post_count'))
    ]);
  };

  Geotag.updateUpdatedAt = async function (ids) {
    await knex('geotags')
      .whereIn('id', ids)
      .update({
        updated_at: knex('geotags_posts')
          .select('created_at')
          .where('geotags_posts.geotag_id', knex.raw('geotags.id'))
          .orderBy('created_at', 'DESC')
          .limit(1)
      });
  };

  const Attachment = bookshelf.Model.extend({
    tableName: 'attachments',
    user() {
      return this.belongsTo(User);
    },
    original() {
      return this.belongsTo(Attachment, 'original_id');
    },
    async download() {
      return downloadAttachment(this.attributes.s3_filename);
    },
    extension() {
      if (!this.attributes.mime_type) {
        return '';
      }

      return mime.extension(this.attributes.mime_type);
    },
    async reupload(fileName, fileData) {
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
    user() {
      return this.belongsTo(User);
    },
    post() {
      return this.belongsTo(Post);
    }
  });

  const Quote = bookshelf.Model.extend({
    tableName: 'quotes'
  });

  const UserMessage = bookshelf.Model.extend({
    tableName: 'user_messages',
    sender() {
      return this.belongsTo(User, 'sender_id');
    },
    reciever() {
      return this.belongsTo(User, 'reciever_id');
    }
  });

  const ProfilePost = bookshelf.Model.extend({
    tableName: 'profile_posts',
    initialize() {
      this.on('saving', this.validate.bind(this));
      this.on('saving', this.renderMarkdown.bind(this));
    },
    renderMarkdown(model = this) {
      if (_.isString(model.get('text'))) {
        const html = postMarkdown.render(model.get('text'));
        model.set('html', html);
      }
    },
    validate() {
      return new Checkit(ProfilePostValidations).run(this.toJSON());
    },
    user() {
      return this.belongsTo(User, 'user_id');
    }
  });

  const Posts = bookshelf.Collection.extend({
    model: Post
  });

  const Bookmark = bookshelf.Model.extend({
    tableName: 'bookmarks',
    user() {
      return this.belongsTo(User, 'user_id');
    }
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
  bookshelf.model('UserMessage', UserMessage);
  bookshelf.model('ProfilePost', ProfilePost);
  bookshelf.model('Bookmark', Bookmark);
  bookshelf.collection('Posts', Posts);

  return bookshelf;
}

export default function initBookshelf(config) {
  const knex = Knex(config);
  return initBookshelfFromKnex(knex);
}
