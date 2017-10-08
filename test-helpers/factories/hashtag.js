import { Factory } from 'rosie';
import faker from 'faker';

import { bookshelf, knex } from '../db';


const Hashtag = bookshelf.model('Hashtag');


const HashtagFactory = new Factory()
  .attr('name', () => faker.company.companyName());

export default HashtagFactory;

export async function createHashtag(attrs = {}) {
  return await new Hashtag(HashtagFactory.build(attrs))
    .save(null, { method: 'insert' });
}

export async function createHashtags(attrs) {
  if (typeof attrs === 'number') {
    attrs = Array.apply(null, Array(attrs));
  }

  const fullAttrs = attrs.map(attrs => HashtagFactory.build(attrs));
  const ids = await knex.batchInsert('hashtags', fullAttrs).returning('id');
  const hashtags = await Hashtag.collection().query(qb => qb.whereIn('id', ids)).fetch({ require: true });

  return hashtags.toArray();
}
