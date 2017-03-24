import { Factory } from 'rosie';
import faker from 'faker';

import { bookshelf } from '../db';


const ProfilePostFactory = new Factory()
  .attr('type', 'text')
  .attr('text', () => faker.lorem.sentence());

export default ProfilePostFactory;

export async function createProfilePost(userId) {
  const ProfilePost = bookshelf.model('ProfilePost');
  const attrs = ProfilePostFactory.build({ user_id: userId });

  return await new ProfilePost(attrs).save();
}
