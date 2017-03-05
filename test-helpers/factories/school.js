import { Factory } from 'rosie';
import faker from 'faker';
import slug from 'slug';

import { bookshelf } from '../db';


const School = bookshelf.model('School');

const SchoolFactory = new Factory()
  .attr('name', () => faker.company.companyName())
  .attr('url_name', ['name'], (name) => slug(name));

export default SchoolFactory;

export async function createSchool(attrs = {}) {
  return await new School(SchoolFactory.build(attrs))
    .save(null, { method: 'insert' });
}
