import uuid from 'uuid';
import bcrypt from 'bcrypt';
import { Factory } from 'rosie';
const faker = require('faker');


export default new Factory()
  .attr('id', () => uuid.v4())
  .attr('created_at', () => faker.date.recent())
  .attr('updated_at', () => faker.date.recent())
  .attr('username', () => faker.internet.userName().toLowerCase())
  .attr('email', () => faker.internet.email())
  .attr('password', () => faker.internet.password())
  .attr('hashed_password', ['password'], password => bcrypt.hashSync(password, 10))
  .attr('email_check_hash', '')
  .attr('more', { first_login: false });
