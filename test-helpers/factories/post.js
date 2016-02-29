import uuid from 'uuid';
import { Factory } from 'rosie';
const faker = require('faker');


export default new Factory()
  .attr('id', () => uuid.v4())
  .attr('text', () => faker.lorem.paragraph())
  .attr('type', 'short_text');
