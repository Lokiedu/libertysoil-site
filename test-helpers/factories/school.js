import { Factory } from 'rosie';
import faker from 'faker';
import slug from 'slug';

import { bookshelf, knex } from '../db';


const School = bookshelf.model('School');

const SchoolFactory = new Factory()
  .attr('name', () => faker.lorem.words(3))
  .attr('url_name', ['name'], (name) => slug(name))
  .attr('created_at', () => faker.date.past())
  .attr('updated_at', ['created_at'], (date) => date);

export default SchoolFactory;

export async function createSchool(attrs = {}) {
  return await new School(SchoolFactory.build(attrs))
    .save(null, { method: 'insert' });
}

export async function createSchools(attrs) {
  if (typeof attrs === 'number') {
    attrs = Array.apply(null, Array(attrs));
  }

  const fullAttrs = attrs.map(attrs => SchoolFactory.build(attrs));
  const ids = await knex.batchInsert('schools', fullAttrs).returning('id');
  const schools = await School.collection().query(qb => qb.whereIn('id', ids)).fetch({ require: true });

  return schools.toArray();
}
