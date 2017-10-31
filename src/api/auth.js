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
import path from 'path';
import { get, isString } from 'lodash';
import bb from 'bluebird';
import bcrypt from 'bcrypt';
import uuid from 'uuid';
import slug from 'slug';
import passport from 'koa-passport';
import { Strategy as LocalStrategy } from 'passport-local';
import FacebookStrategy from 'passport-facebook';
import GoogleStrategy from 'passport-google-oauth20';
import TwitterStrategy from 'passport-twitter';
import GithubStrategy from 'passport-github';
import fetch from 'node-fetch';

import { processImage } from '../utils/image';
import { AVATAR_SIZE } from '../consts/profileConstants';
import { API_URL_PREFIX } from '../config';
import { USER_RELATIONS } from './consts';

import {
  FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET,
  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
  TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET,
  GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
} from './env';


const bcryptAsync = bb.promisifyAll(bcrypt);

export class WrongPasswordError extends Error {}

/**
 * Sets up:
 *   1. Serialization of the current user into the session.
 *   2. Deserialization of the user from the session (which is just taking and returning an id).
 *   3. Auth strategies.
 */
export function setUpPassport(bookshelf) {
  const User = bookshelf.model('User');

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // Makes user id accessible as `ctx.state.user`
  passport.deserializeUser(async function (id, done) {
    // deserializeUser is invoked on each request, so to keep our server fast,
    // we only store an id and fetch the current user on demand manually. Though a proper caching
    // system could make an automatic user acquisition fast.
    done(null, id);
  });

  // Local
  passport.use(new LocalStrategy(async function (username, password, done) {
    try {
      const user = await new User({ username: username.toLowerCase() })
        .fetch({ require: true });
      const passwordIsValid = await bcryptAsync.compareAsync(password, user.get('hashed_password'));

      if (passwordIsValid) {
        done(null, user);
      } else {
        throw new WrongPasswordError();
      }
    } catch (e) {
      done(e);
    }
  }));

  // Facebook
  passport.use(new FacebookStrategy(
    {
      clientID: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
      callbackURL: `${API_URL_PREFIX}/auth/facebook/callback`,
      passReqToCallback: true,
      profileFields: ['id', 'displayName', 'name', 'profileUrl', 'emails', 'photos']
    },
    getStrategyCallback(bookshelf, 'facebook')
  ));

  // Google
  // Enable Google+ api in app settings.
  passport.use(new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${API_URL_PREFIX}/auth/google/callback`,
      passReqToCallback: true
    },
    getStrategyCallback(bookshelf, 'google')
  ));

  // Twitter
  // Enable "Request email addresses from users" in app settings.
  passport.use(new TwitterStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL: `${API_URL_PREFIX}/auth/twitter/callback`,
      passReqToCallback: true,
      includeEmail: true
    },
    getStrategyCallback(bookshelf, 'twitter')
  ));

  // Github
  passport.use(new GithubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: `${API_URL_PREFIX}/auth/github/callback`,
      passReqToCallback: true
    },
    getStrategyCallback(bookshelf, 'github')
  ));

  return passport;
}

/**
 * Returns HTML with a script that calls window.oauthCallback of the parent window and closes the popup.
 */
function renderCallbackResponse({ profile, user, error }) {
  return (`<!DOCTYPE html>
<html>
  <head>
    <script>
      var profile = ${JSON.stringify(profile)};
      var user = ${JSON.stringify(user && user.toJSON())};
      var error = ${JSON.stringify(error && error.message)};
      if (window.opener) {
        window.opener.focus();

        if(window.opener.oauthCallback) {
          window.opener.oauthCallback({ profile: profile, user: user, error: error });
        }
      }
      window.close();
    </script>
  </head>
</html>`
  );
}

/**
 * Example:
 *  john.doe@gmail.com => johndoe{n}
 *  John Doe => john-doe{n}
 */
async function generateUsername(User, { firstName, secondName, email, username }) {
  async function userExists(username) {
    const user = await new User().where({ username }).fetch();
    !!user;
  }

  let generatedUsername;
  if (isString(username)) {
    generatedUsername = slug(username);
  } else if (isString(email)) {
    generatedUsername = slug(email.split('@')[0]);
  } else if (isString(firstName) && isString(secondName)) {
    generatedUsername = slug(`${firstName} ${secondName}`);
  } else {
    throw new Error(`Could not generate username`);
  }

  for (let n = 1, old = generatedUsername; await userExists(generatedUsername); ++n) {
    generatedUsername = `${old}${n}`;
  }

  return generatedUsername.toLowerCase();
}

async function createAvatarFromUrl({ bookshelf, url, userId }, options = {}) {
  const Attachment = bookshelf.model('Attachment');
  const ProfilePost = bookshelf.model('ProfilePost');

  try {
    const filename = path.basename(url);
    const buffer = await fetch(url).then(res => res.buffer());
    const processedBuffer = await processImage(buffer, [{ resize: AVATAR_SIZE }]);
    const fullAttachment = await Attachment.create(filename, buffer, { user_id: userId }, options);
    const avatarAttachment = await fullAttachment.reupload(filename, processedBuffer, options);

    const avatarObj = {
      url: avatarAttachment.get('s3_url'),
      attachment_id: avatarAttachment.id,
    };

    await new ProfilePost({
      more: avatarObj,
      user_id: userId,
      type: 'avatar'
    }).save(null, options);

    return avatarObj;
  } catch (e) {
    e.message = `Could not create a user avatar: ${e.message}`;
    throw e;
  }
}

/**
 * Returns a callback function for strategies.
 * Because passport-{provider} strategies accept callbacks with same signatures, and profile is
 * standard across different providers, it's possible to write a generalized callback function.
 * @param {String} strategyKey Represents a key in `users.providers`.
 */
function getStrategyCallback(bookshelf, strategyKey) {
  const User = bookshelf.model('User');

  return async function findOrCreateUser(req, token, tokenSecret, profile, done) {
    // Don't create user, only respond with a profile.
    if (req.ctx.session.only_oauth_profile) {
      req.ctx.session.only_oauth_profile = false;
      req.ctx.body = renderCallbackResponse({ profile });
      done(null, null);
      return;
    }

    try {
      const email = get(profile, 'emails[0].value');
      // get by the provider user id
      let user = await new User().query(qb => {
        qb.whereRaw(`providers->'${strategyKey}'->>'id' = ?`, profile.id);
      }).fetch();

      // or try to get by email
      if (!user && email) {
        user = await new User().where({ email }).fetch();
      }

      // add/update oauth profile
      if (user) {
        await user.save({
          providers: {
            ...user.get('providers'),
            [strategyKey]: profile
          }
        }, { patch: true, require: true });
      }

      // if nothing was found, create a new account
      if (!user && email) {
        await bookshelf.transaction(async t => {
          const userId = uuid.v4();
          let firstName = get(profile, 'name.givenName');
          let lastName = get(profile, 'name.familyName');
          if ((!firstName || !lastName) && profile.displayName) { // twitter doesn't provide firstName and lastName
            [firstName, lastName] = profile.displayName.split(' ');
          }

          user = await new User().save({
            id: userId,
            username: await generateUsername(
              User,
              {
                firstName,
                lastName,
                email,
                username: profile.username
              }
            ),
            email, // may not be present
            providers: {
              [strategyKey]: profile,
            }
          }, { require: true, transacting: t });

          const more = {
            firstName,
            lastName,
            first_login: true
          };

          if (get(profile, 'photos[0].value')) {
            more.avatar = await createAvatarFromUrl({
              bookshelf,
              url: get(profile, 'photos[0].value'),
              logger: req.ctx.app.logger,
              userId
            }, { transacting: t });
          }

          await user.save({ more }, { patch: true, require: true, transacting: t });
        });
      }

      if (user) {
        await req.ctx.login(user);
        user = await user.refresh({ withRelated: USER_RELATIONS });
      }

      req.ctx.body = renderCallbackResponse({ profile, user });
      done(null, user);
    } catch (error) {
      req.ctx.app.logger.error(error);
      req.ctx.body = renderCallbackResponse({ profile, error });
      // passport doesn't need to know about the error. Callback must always respond with a script no matter what.
      done(null);
    }
  };
}

function getAuthParams(strategy) {
  const params = {};

  switch (strategy) {
    case 'facebook': {
      params.scope = ['email', 'public_profile'];
      break;
    }
    case 'google': {
      params.scope = ['email'];
      break;
    }
    case 'github': {
      params.scope = ['user:email'];
      break;
    }
    case 'twitter': {
      break;
    }
    default: throw new Error(`Unknown auth strategy '${strategy}'`);
  }

  return params;
}

/**
 * Returns a wrapping controller for passport.authenticate which logs in a user and
 * responds with a profile and the user.
 * It's possible to use this controller for:
 *   1. Creating a new user on the first login.
 *      Email must be present, otherwise a new user will not be created and the controller
 *      will only respond with a oauth profile.
 *   2. Adding a new authentication method to a user (if emails match).
 *   3. Logging in.
 *   4. Getting oauth profile without authenticating (set the `onlyProfile` option to true).
 */
export function getAuthController(strategy, passport, options = {}) {
  return function authController(ctx, next) {
    return passport.authenticate(strategy, getAuthParams(strategy), function (error) {
      //
      if (options.resetOnlyProfile) {
        delete ctx.session.only_oauth_profile;
      }

      // Process internal passport errors
      if (error) {
        ctx.body = renderCallbackResponse({ error });
      }
    })(ctx, next);
  };
}

export function getAuthProfileController(strategy, passport) {
  return function authController(ctx, next) {
    ctx.session.only_oauth_profile = true;

    return passport.authenticate(strategy, getAuthParams(strategy), function (error) {
      // Process internal passport errors
      if (error) {
        ctx.body = renderCallbackResponse({ error });
      }
    })(ctx, next);
  };
}

/**
 * Koa middleware for enforcing authentication.
 */
export function auth(ctx, next) {
  if (ctx.isUnauthenticated()) {
    ctx.status = 403;
    ctx.body = { error: 'api.errors.forbidden' };
    return null;
  }

  return next();
}
