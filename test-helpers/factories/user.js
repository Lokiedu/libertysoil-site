import uuid from 'uuid';
import bcrypt from 'bcrypt';
import { Factory } from 'rosie';
import faker from 'faker';

import { bookshelf } from '../db';


const User = bookshelf.model('User');

const UserFactory = new Factory()
  .attr('id', () => uuid.v4())
  .attr('created_at', () => faker.date.recent())
  .attr('updated_at', () => faker.date.recent())
  .attr('username', () => faker.internet.userName().toLowerCase())
  .attr('email', () => faker.internet.email())
  .attr('password', () => faker.internet.password())
  .attr('hashed_password', ['password'], password => bcrypt.hashSync(password, 10))
  .attr('email_check_hash', '')
  .attr('more', {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    first_login: false
  });

export default UserFactory;

export async function createUser(attrs = {}) {
  const userAttrs = UserFactory.build(attrs);
  const user = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);
  await user.save({ email_check_hash: null }, { method: 'update' });
  user.attributes.password = userAttrs.password;

  return user;
}
