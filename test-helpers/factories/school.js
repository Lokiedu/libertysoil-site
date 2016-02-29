import { Factory } from 'rosie';
const faker = require('faker');
import slug from 'slug';

export default new Factory()
  .attr('name', () => faker.company.companyName())
  .attr('url_name', ['name'], (name) => slug(name));
