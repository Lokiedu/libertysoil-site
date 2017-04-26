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
import difference from 'lodash/difference';
import uniq from 'lodash/uniq';

export const User = {
  registration: {
    username: [
      'required',
      'maxLength:31',
      { rule: (val) => {
        if (!val.match(/^(?!.*\.{2})[a-z0-9\-\_\'\.]+$/i)) {
          throw new Error("Username can contain letters a-z, numbers 0-9, dashes (-), underscores (_), apostrophes (\'), and periods (.)");
        }
      }
      }],
    password: [
      'required',
      {
        rule: (val) => {
          if (!val.match(/^[\x20-\x7E]{8,}$/)) {
            throw new Error("Password is min. 8 characters. Password can only have ascii characters.");
          }
        }
      }
    ],
    firstName: [
    ],
    lastName: [
    ],
    // email: ['email', 'required']
    email: [
      'required',
      {
        rule: (val) => {
          if (!val.match(/^[a-z0-9!#$%&"'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i)) {
            throw new Error('The email must be a valid email address');
          }
        }
      }
    ]
  },

  settings: {
    base: {
    },
    more: {
      summary: ['string'],
      bio: ['string'],
      roles: ['array'],
      first_login: ['boolean'],
      avatar: ['plainObject'],
      head_pic: ['plainObject'],
      mute_all_posts: ['boolean'],
      firstName: ['string'],
      lastName: ['string']
    }
  }
};

export const School = {
  more: {
    head_pic: ['plainObject'],
    last_editor: ['string']
  }
};

export const Geotag = {
  more: {
    description: ['string'],
    last_editor: ['string']
  }
};

export const Hashtag = {
  more: {
    description: ['string'],
    head_pic: ['plainObject'],
    last_editor: ['string']
  }
};

export const UserMessage = {
  text: ['string', 'minLength:1', 'required']
};

export const ProfilePost = {
  text: ['string', 'maxLength:200'],
  html: ['string'],
  type: [
    'required',
    val => {
      if (!ProfilePost.TYPES.includes(val)) {
        throw new Error('Invalid post type');
      }
    }
  ],
  user_id: ['required', 'uuid'],
  more: ['plainObject']
};

ProfilePost.TYPES = [
  'text',
  'head_pic',
  'avatar'
];

const SEARCH_RESULT_TYPES = [
  'hashtags',
  'locations',
  'posts',
  'people',
  'schools'
];
const SORTING_TYPES = [
  '-q',
  '-updated_at'
];
export const SearchQuery = {
  limit: ['integer', 'natural'],
  offset: ['integer', 'natural'],
  show: {
    rule: val => {
      if (val) {
        if (typeof val === 'string') {
          if (val !== 'all' && !SEARCH_RESULT_TYPES.includes(val)) {
            throw new Error('Unsupported type of search result');
          }
        } else if (Array.isArray(val)) {
          const unique = uniq(val);
          if (unique.length > 1 && unique.includes('all')) {
            throw new Error('Ambiguity between "all" and explicit type of search results');
          } else if (difference(unique, SEARCH_RESULT_TYPES).length > 0) {
            throw new Error('At least one of presented search result types is unsupported');
          }
        } else {
          throw new Error('Type of search results is expected to be a string or an array');
        }
      }
    }
  },
  sort: ['string', val => {
    if (val && !SORTING_TYPES.includes(val)) {
      throw new Error('Invalid search sorting type');
    }
  }],
  q: ['string']
};

export const Bookmark = {
  more: ['required', 'plainObject'],
  'more.description': ['string'],
  'more.icon': ['string'],
  ord: ['integer'],
  title: ['required', 'string'],
  url: ['required', 'string']
};
