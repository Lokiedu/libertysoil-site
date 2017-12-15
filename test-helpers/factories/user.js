import { omit } from 'lodash';
import uuid from 'uuid';
import bcrypt from 'bcrypt';
import { Factory } from 'rosie';
import faker from 'faker';

import { bookshelf, knex } from '../db';


const User = bookshelf.model('User');

const UserFactory = new Factory()
  .attr('id', () => uuid.v4())
  .attr('created_at', () => faker.date.recent())
  .attr('updated_at', () => faker.date.recent())
  .attr('username', () => faker.internet.userName().toLowerCase())
  .attr('email', () => faker.internet.email())
  .attr('password', () => faker.internet.password())
  .attr('hashed_password', ['password'], password => bcrypt.hashSync(password, 10))
  .attr('email_check_hash', () => Math.random().toString())
  .attr('more', () => ({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    first_login: false
  }));

export default UserFactory;

export async function createUser(attrs = {}) {
  const userAttrs = UserFactory.build(attrs);
  const user = await new User(omit(userAttrs, 'password')).save(null, { method: 'insert' });
  await user.save({ email_check_hash: attrs.email_check_hash || null }, { method: 'update' });
  user.attributes.password = userAttrs.password;

  return user;
}

/**
 * number of elements in `attr` = number of created users.
 */
export async function createUsers(attrs = []) {
  if (typeof attrs === 'number') {
    attrs = Array.apply(null, Array(attrs));
  }

  const fullAttrs = attrs.map(attrs => UserFactory.build(attrs));
  const filteredAttrs = fullAttrs.map(attrs => omit(attrs, 'password'));
  const ids = await knex.batchInsert('users', filteredAttrs).returning('id');
  let users = await User.collection().query(qb => qb.whereIn('id', ids)).fetch({ require: true });
  users = users.toArray();

  for (const user of users) {
    user.attributes.password = fullAttrs.find(attrs => attrs.id === user.id).password;
  }

  return users;
}
