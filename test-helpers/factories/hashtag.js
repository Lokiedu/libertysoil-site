import { Factory } from 'rosie';
import faker from 'faker';

import { bookshelf } from '../db';


const Hashtag = bookshelf.model('Hashtag');


const HashtagFactory = new Factory()
  .attr('name', () => faker.company.companyName());

export default HashtagFactory;

export async function createHashtag(attrs = {}) {
  return await new Hashtag(HashtagFactory.build(attrs))
    .save(null, { method: 'insert' });
}
