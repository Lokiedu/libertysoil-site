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
import _ from 'lodash';
import Joi from 'joi';
import bb from 'bluebird';
import bcrypt from 'bcrypt';

import { UserRegistrationValidator, UserSettingsValidator } from '../validators';
import { WrongPasswordError } from '../auth';
import { USER_RELATIONS } from '../consts';
import { applySortQuery } from '../utils/filters';

const bcryptAsync = bb.promisifyAll(bcrypt);

export async function registerUser(ctx) {
  const optionalFields = ['firstName', 'lastName'];

  Joi.attempt(ctx.request.body, UserRegistrationValidator);

  const User = ctx.bookshelf.model('User');
  const username = ctx.request.body.username.toLowerCase();

  {
    const check = await User.where({ username }).fetch({ require: false });
    if (check) {
      ctx.status = 409;
      ctx.body = { error: 'signup.errors.username_taken' };
      return;
    }
  }

  {
    const check = await User.where({ email: ctx.request.body.email }).fetch({ require: false });
    if (check) {
      ctx.status = 409;
      ctx.body = { error: 'signup.errors.email_taken' };
      return;
    }
  }

  const moreData = {};
  for (const fieldName of optionalFields) {
    if (fieldName in ctx.request.body) {
      moreData[fieldName] = ctx.request.body[fieldName];
    }
  }

  moreData.first_login = true;

  let user;

  try {
    user = await User.create({
      username,
      password: ctx.request.body.password,
      email: ctx.request.body.email,
      more: moreData,
      providers: _.pick(
        ctx.request.body.providers,
        ['facebook', 'google', 'twitter', 'github']
      )
    });
  } catch (e) {
    if (e.code == 23505) {
      ctx.status = 401;
      ctx.body = { error: 'signup.errors.username_taken' };
      return;
    }

    throw e;
  }

  ctx.jobQueue.createJob('register-user-email', {
    username: user.get('username'),
    email: user.get('email'),
    hash: user.get('email_check_hash')
  });

  ctx.body = { success: true, user };
}

export async function login(ctx, next) {
  if (!ctx.session) {
    ctx.app.emit('error', 'Session engine is not available, have you started redis service?');

    ctx.status = 500;
    ctx.body = { error: 'api.errors.internal' };
    return;
  }

  if (ctx.isAuthenticated()) {
    ctx.status = 400;
    ctx.body = { error: 'login.errors.already_logged_in' };
  }

  const authenticator = ctx.passport.authenticate('local', async (err, user) => {
    if (err || !user) {
      if (err) {
        if (err instanceof ctx.bookshelf.NotFoundError) {
          ctx.app.logger.warn(`Someone tried to log in as '${ctx.request.body.username}', but there's no such user`);
        } else if (err instanceof WrongPasswordError) {
          ctx.app.logger.warn(`Someone tried to log in as '${ctx.request.body.username}', but used wrong pasword`);
        }
      }

      ctx.body = { success: false, error: 'login.errors.invalid' };
      ctx.status = 401;
      return;
    }

    if (user.get('email_check_hash')) {
      ctx.app.logger.warn(`user '${user.get('username')}' has not validated email`);
      ctx.status = 401;
      ctx.body = { success: false, error: 'login.errors.email_unchecked' };
      return;
    }

    await ctx.login(user);
    await user.refresh({ withRelated: USER_RELATIONS });
    ctx.body = { success: true, user };
  });

  await authenticator(ctx, next);
}

export async function checkUserExists(ctx) {
  const User = ctx.bookshelf.model('User');

  await new User()
    .where('username', ctx.params.username)
    .fetch({ require: true });

  ctx.status = 200;
}

export async function checkEmailTaken(ctx) {
  const User = ctx.bookshelf.model('User');

  await User
    .forge()
    .where('email', ctx.params.email)
    .fetch({ require: true });

  ctx.status = 200;
}

export async function getAvailableUsername(ctx) {
  const User = ctx.bookshelf.model('User');

  async function checkUserExists(username) {
    const user = await User
      .forge()
      .where('username', username)
      .fetch();

    return !!user;
  }

  let username = ctx.params.username;

  for (let i = 1; await checkUserExists(username); ++i) {
    username = `${ctx.params.username}${i}`;
  }

  ctx.body = { username };
}

export async function verifyEmail(ctx) {
  const User = ctx.bookshelf.model('User');

  let user;

  try {
    user = await new User({ email_check_hash: ctx.params.hash }).fetch({ require: true });
  } catch (e) {
    ctx.app.logger.warn(`Someone tried to verify email, but used invalid hash`);
    ctx.status = 401;
    ctx.body = { success: false };
    return;
  }

  user.set('email_check_hash', '');
  await user.save(null, { method: 'update' });

  ctx.jobQueue.createJob('verify-email', {
    username: user.get('username'),
    email: user.get('email')
  });

  ctx.redirect('/');
}

/**
 * Looks users record by submitted email, saves user random SHA1 hash.
 * If user is authorized. Show error message.
 *
 * If no user found send status 401.
 *
 * When user saved successfully, send message (publich event?) to user with
 * Reset password end-point url like: http://libertysoil/resetpasswordfrom?code={generatedcode}
 */
export async function resetPassword(ctx) {
  if (ctx.isAuthenticated()) {
    ctx.status = 403;
    ctx.body = { error: 'Please use profile change password feature.' };
    return;
  }

  for (const fieldName of ['email']) {
    if (!(fieldName in ctx.request.body)) {
      ctx.status = 400;
      ctx.body = { error: 'Bad Request' };
      return;
    }
  }

  const User = ctx.bookshelf.model('User');

  let user;

  try {
    user = await new User({ email: ctx.request.body.email }).fetch({ require: true });
  } catch (e) {
    // we do not show any error if we do not have user.
    // To prevent disclosure information about registered emails.
    ctx.status = 200;
    ctx.body = { success: true };
    return;
  }

  const random = Math.random().toString();
  const sha1 = crypto.createHash('sha1').update(user.email + random).digest('hex');

  if (!user.get('reset_password_hash')) {
    user.set('reset_password_hash', sha1);
    await user.save(null, { method: 'update' });
  }

  ctx.jobQueue.createJob('reset-password-email', {
    username: user.get('username'),
    email: ctx.request.body.email,
    hash: user.get('reset_password_hash')
  });

  ctx.status = 200;
  ctx.body = { success: true };
}

/**
 * New password form action.
 * Validates new password form with password/password repeat values.
 * Saves new password to User model.
 */
export async function newPassword(ctx) {
  if (ctx.isAuthenticated()) {
    ctx.redirect('/');
    return;
  }

  const User = ctx.bookshelf.model('User');
  const PasswordChange = ctx.bookshelf.model('PasswordChange');

  let user;

  try {
    user = await new User({ reset_password_hash: ctx.params.hash }).fetch({ require: true });
  } catch (e) {
    ctx.app.logger.warn(`Someone tried to reset password using unknown reset-hash`);
    ctx.status = 401;
    ctx.body = { success: false, error: 'Unauthorized' };
    return;
  }

  if (!('password' in ctx.request.body) || !('password_repeat' in ctx.request.body)) {
    ctx.status = 400;
    ctx.body = { error: '"password" or "password_repeat" parameter is not provided' };
    return;
  }

  if (ctx.request.body.password !== ctx.request.body.password_repeat) {
    ctx.status = 400;
    ctx.body = { error: '"password" and "password_repeat" do not exact match.' };
    return;
  }

  const hashedPassword = await bcryptAsync.hashAsync(ctx.request.body.password, 10);
  const prevHashedPassword = user.get('hashed_password');

  user.set('hashed_password', hashedPassword);
  user.set('reset_password_hash', '');

  await user.save(null, { method: 'update' });

  await new PasswordChange({
    user_id: user.id,
    prev_hashed_password: prevHashedPassword,
    ip: ctx.ip,
    event_type: 'reset'
  }).save();

  ctx.body = { success: true };
}

export async function logout(ctx) {
  ctx.logout();
  ctx.redirect('/');
}

export async function userSuggestions(ctx) {
  const User = ctx.bookshelf.model('User');

  const user = await User.where({ id: ctx.state.user }).fetch({ require: true, withRelated: ['ignored_users', 'following'] });

  const ignoredIds = user.related('ignored_users').pluck('id');
  const followingIds = user.related('following').pluck('id');

  const usersToIgnore = _.uniq(_.concat(ignoredIds, followingIds));

  const suggestions = await User
    .collection()
    .query(qb => {
      qb
        .select('active_users.*')
        .from(function () {
          this.select('users.*')
            .count('posts.id as post_count')
            .from('users')
            .where('users.id', '!=', ctx.state.user)
            .leftJoin('posts', 'users.id', 'posts.user_id')
            .groupBy('users.id')
            .as('active_users');
        })
        .whereNotIn('active_users.id', usersToIgnore)
        .orderBy('post_count', 'desc')
        .limit(6);
    })
    .fetch({ withRelated: ['following', 'followers', 'liked_posts', 'favourited_posts'] });

  ctx.body = suggestions;
}

export async function initialSuggestions(ctx) {
  const User = ctx.bookshelf.model('User');

  const q = User.forge()
    .query(qb => {
      qb
        .select('users.*')
        .count('posts.id as post_count')
        .from('users')
        .where('users.id', '!=', ctx.state.user)
        .leftJoin('posts', 'users.id', 'posts.user_id')
        .groupBy('users.id')
        .orderBy('post_count', 'desc')
        .limit(20);
    });

  const suggestions = await q.fetchAll({ withRelated: ['following', 'followers', 'liked_posts', 'favourited_posts'] });

  ctx.body = suggestions;
}

export async function getUser(ctx) {
  const User = ctx.bookshelf.model('User');

  const user = await User
    .where({ username: ctx.params.username })
    .fetch({
      require: true,
      withRelated: USER_RELATIONS
    });

  ctx.body = user;
}

export async function getFollowedUsers(ctx) {
  const User = ctx.bookshelf.model('User');

  const users = await User.collection()
    .query(qb => {
      qb.join('followers', 'users.id', 'followers.following_user_id')
        .where('followers.user_id', ctx.params.id);
    })
    .fetch({
      withRelated: USER_RELATIONS
    });

  ctx.body = users;
}

export async function getMutualFollows(ctx) {
  const User = ctx.bookshelf.model('User');
  const knex = ctx.bookshelf.knex;

  // TODO: Is it possible to use joins insted of subqueries here? Which method is faster?
  const users = await User.collection()
    .query(qb => {
      qb
        .whereExists(function () {
          this.select('*')
            .from(knex.raw('followers as f2'))
            .whereRaw('f2.user_id = ?', ctx.params.id)
            .whereRaw('f2.following_user_id = users.id');
        })
        .whereExists(function () {
          this.select('*')
            .from(knex.raw('followers as f2'))
            .whereRaw('f2.following_user_id = ?', ctx.params.id)
            .whereRaw('f2.user_id = users.id');
        });

      applySortQuery(qb, ctx.query, { defaultValue: 'username' });
    })
    .fetch({
      withRelated: USER_RELATIONS
    });

  ctx.body = users;
}

export async function followUser(ctx) {
  const User = ctx.bookshelf.model('User');
  const follow_status = { success: false };

  let user = await User.where({ id: ctx.state.user }).fetch({ require: true, withRelated: ['following', 'followers'] });
  let follow = await User.where({ username: ctx.params.username }).fetch({ require: true, withRelated: ['following', 'followers'] });

  if (user.id != follow.id && _.isUndefined(user.related('following').find({ id: follow.id }))) {
    await user.following().attach(follow);

    follow_status.success = true;
    user = await User.where({ id: ctx.state.user }).fetch({ require: true, withRelated: ['following', 'followers'] });
    follow = await User.where({ username: ctx.params.username }).fetch({ require: true, withRelated: ['following', 'followers'] });
  }

  follow_status.user1 = user.toJSON();
  follow_status.user2 = follow.toJSON();

  ctx.body = follow_status;
}

export async function unfollowUser(ctx) {
  const User = ctx.bookshelf.model('User');
  const follow_status = { success: false };

  let user = await User.where({ id: ctx.state.user }).fetch({ require: true, withRelated: ['following', 'followers'] });
  let follow = await User.where({ username: ctx.params.username }).fetch({ require: true, withRelated: ['following', 'followers'] });

  if (user.id != follow.id && !_.isUndefined(user.related('following').find({ id: follow.id }))) {
    await user.following().detach(follow);

    follow_status.success = true;
    user = await User.where({ id: ctx.state.user }).fetch({ require: true, withRelated: ['following', 'followers'] });
    follow = await User.where({ username: ctx.params.username }).fetch({ require: true, withRelated: ['following', 'followers'] });
  }

  follow_status.user1 = user.toJSON();
  follow_status.user2 = follow.toJSON();

  ctx.body = follow_status;
}

export async function ignoreUser(ctx) {
  const User = ctx.bookshelf.model('User');

  const user = await User.where({ id: ctx.state.user }).fetch({ require: true, withRelated: ['ignored_users'] });
  const userToIgnore = await User.where({ username: ctx.params.username }).fetch({ require: true });

  await user.ignoreUser(userToIgnore.id);

  ctx.body = { success: true };
}

export async function updateUser(ctx) {
  const User = ctx.bookshelf.model('User');
  const ProfilePost = ctx.bookshelf.model('ProfilePost');

  const validationResult = Joi.attempt(ctx.request.body, UserSettingsValidator);

  const user = await User.where({ id: ctx.state.user }).fetch({ require: true });
  const more = validationResult.more;

  const newPictures = {};
  ['avatar', 'head_pic'].forEach(fieldName => {
    const updated = more[fieldName];
    if (updated) {
      const old = user.get('more')[fieldName];
      if (!old) {
        newPictures[fieldName] = updated;
      } else if (updated.attachment_id !== old.attachment_id) {
        newPictures[fieldName] = updated;
      }
    }
  });

  user.set('more', _.extend(user.get('more'), more));

  await user.save(null, { method: 'update' });

  await Promise.all(Object.keys(newPictures).map(type =>
    new ProfilePost({
      more: newPictures[type],
      user_id: ctx.state.user,
      type
    }).save(null, { method: 'insert' })
  ));

  ctx.body = { user };
}

export async function changePassword(ctx) {
  if (!('old_password' in ctx.request.body) || !('new_password' in ctx.request.body)) {
    ctx.status = 400;
    ctx.body = { error: '"old_password" or "new_password" parameter is not provided' };
    return;
  }

  const User = ctx.bookshelf.model('User');
  const PasswordChange = ctx.bookshelf.model('PasswordChange');

  const user = await User.where({ id: ctx.state.user }).fetch({ require: true });

  const passwordIsValid = await bcryptAsync.compareAsync(ctx.request.body.old_password, user.get('hashed_password'));

  if (!passwordIsValid) {
    ctx.status = 401;
    ctx.body = { error: 'old password is incorrect' };
    return;
  }

  const hashedPassword = await bcryptAsync.hashAsync(ctx.request.body.new_password, 10);
  const prevHashedPassword = user.get('hashed_password');

  user.set('hashed_password', hashedPassword);

  await user.save(null, { method: 'update' });

  await new PasswordChange({
    user_id: user.id,
    prev_hashed_password: prevHashedPassword,
    ip: ctx.ip,
    event_type: 'change'
  }).save();

  ctx.body = { success: true };
}
