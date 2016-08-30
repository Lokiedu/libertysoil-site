import uuid from 'uuid';
import bcrypt from 'bcrypt';
import { Factory } from 'rosie';
const faker = require('faker');


export default new Factory()
  .attr('id', () => uuid.v4())
  .attr('username', () => faker.internet.userName().toLowerCase())
  .attr('email', () => faker.internet.email())
  .attr('password', () => faker.internet.password())
  .attr('hashed_password', ['password'], password => bcrypt.hashSync(password, 10))
  .attr('email_check_hash', '');
