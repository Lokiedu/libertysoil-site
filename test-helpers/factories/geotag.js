import { Factory } from 'rosie';
import faker from 'faker';
import slug from 'slug';

import { bookshelf, knex } from '../db';


const Geotag = bookshelf.model('Geotag');

const GeotagFactory = new Factory()
  .attr('name', () => faker.address.city())
  .attr('type', 'City')
  .attr('url_name', ['name'], (name) => slug(name))
  .attr('created_at', () => faker.date.past())
  .attr('updated_at', ['created_at'], date => date);

export default GeotagFactory;

export async function createGeotag(attrs = {}) {
  return await new Geotag(GeotagFactory.build(attrs))
    .save(null, { method: 'insert' });
}

export async function createGeotags(attrs) {
  if (typeof attrs === 'number') {
    attrs = Array.apply(null, Array(attrs));
  }

  const fullAttrs = attrs.map(attrs => GeotagFactory.build(attrs));
  const ids = await knex.batchInsert('geotags', fullAttrs).returning('id');
  const geotags = await Geotag.collection().query(qb => qb.whereIn('id', ids)).fetch({ require: true });

  return geotags.toArray();
}
