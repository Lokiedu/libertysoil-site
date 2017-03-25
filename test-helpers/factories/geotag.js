import { Factory } from 'rosie';
import faker from 'faker';
import slug from 'slug';

import { bookshelf } from '../db';


const Geotag = bookshelf.model('Geotag');

const GeotagFactory = new Factory()
  .attr('name', () => faker.address.city())
  .attr('type', 'City')
  .attr('url_name', ['name'], (name) => slug(name));

export default GeotagFactory;

export async function createGeotag(attrs = {}) {
  return await new Geotag(GeotagFactory.build(attrs))
    .save(null, { method: 'insert' });
}
