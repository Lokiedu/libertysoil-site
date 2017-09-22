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
// The validations in this file are meant for user input (form data), not models.
// If you want to validate models, add validations to db/validators.js and use them as a hook on models:
//     bookshelf.Model.extend({
//       initialize() {
//         this.on('saving', this.validate.bind(this));
//       },
//     ...
import Joi from 'joi';

const SUPPORTED_LOCALES = Object.keys(
  require('../consts/localization').SUPPORTED_LOCALES
);

// Use this options to force joi to return only the first error.
const ONLY_ONE_ERROR = { abortEarly: true };

const PictureAttachment = Joi.object({
  url: Joi.string().uri().required(),
  attachment_id: Joi.string().uuid({ version: 'uuidv4' }).optional()
});

export const UserRegistrationValidator = Joi.object({
  username: Joi.string().max(31).regex(/^(?!.*\.{2})[a-z0-9\-_'.]+$/i).required().options(ONLY_ONE_ERROR),
  password: Joi.string().min(8).regex(/^[\x20-\x7E]{8,}$/).required().options(ONLY_ONE_ERROR),
  email: Joi.string().email().required(),
  firstName: Joi.string(),
  lastName: Joi.string()
}).options({ abortEarly: false, stripUnknown: true });

export const UserSettingsValidator = Joi.object({
  more: Joi.object({
    summary: Joi.string(),
    bio: Joi.string(),
    roles: Joi.array(), // TODO: validate role variants
    //first_login: Joi.bool(), // private
    avatar: PictureAttachment,
    head_pic: PictureAttachment,
    mute_all_posts: Joi.bool(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    lang: Joi.string().only(SUPPORTED_LOCALES)
  })
}).options({ abortEarly: false, stripUnknown: true });

export const SchoolValidator = Joi.object({
  more: Joi.object({
    head_pic: PictureAttachment,
    last_editor: Joi.string().uuid({ version: 'uuidv4' })
  })
}).options({ abortEarly: false, stripUnknown: true });

export const GeotagValidator = Joi.object({
  more: Joi.object({
    description: Joi.string(),
    last_editor: Joi.string().uuid({ version: 'uuidv4' })
  })
}).options({ abortEarly: false, stripUnknown: true });

export const HashtagValidator = Joi.object({
  more: Joi.object({
    description: Joi.string(),
    head_pic: PictureAttachment,
    last_editor: Joi.string().uuid({ version: 'uuidv4' })
  })
}).options({ abortEarly: false, stripUnknown: true });

export const UserMessageValidator = Joi.object({
  text: Joi.string().min(1).required()
}).options({ abortEarly: false, stripUnknown: true });

const PROFILE_POST_TYPES = [
  'text',
  'head_pic',
  'avatar'
];

export const ProfilePostValidator = Joi.object({
  text: Joi.string().max(200),
  type: Joi.string().only(PROFILE_POST_TYPES).required(),
  more: Joi.object() // TODO: Keys
}).options({ abortEarly: false, stripUnknown: true });

const SEARCH_RESULT_TYPES = [
  'hashtags',
  'locations',
  'posts',
  'people',
  'schools'
];

const SEARCH_SORTING_TYPES = [
  '-q',
  '-updated_at'
];

export const SearchQueryValidator = Joi.object({
  limit: Joi.number().integer().positive(),
  offset: Joi.number().integer().positive(),
  show: Joi.alternatives().try(
    Joi.string().only(SEARCH_RESULT_TYPES),
    Joi.array().items(Joi.string().only(SEARCH_RESULT_TYPES))
  ),
  sort: Joi.string().only(SEARCH_SORTING_TYPES),
  q: Joi.string().required()
}).options({ stripUnknown: true });

export const PostValidator = Joi.object({
  type: Joi.string().only('short_text', 'long_text', 'story').required(),
  text_source: Joi.string().required(),
  text_type: Joi.string().when('type', {
    is: 'story',
    then: Joi.only('html', 'markdown').required(),
    otherwise: Joi.forbidden()
  }),
  title: Joi.alternatives().when('type', {
    is: ['story', 'long_post'],
    then: Joi.string().min(1),
    otherwise: Joi.forbidden()
  }),
  hashtags: Joi.array().items(Joi.string().min(3)),
  schools: Joi.array().items(Joi.string()),
  geotags: Joi.array().items(Joi.string())
}).options({ abortEarly: false, stripUnknown: true });
