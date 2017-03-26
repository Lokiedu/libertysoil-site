import { Factory } from 'rosie';
import faker from 'faker';

import { bookshelf } from '../db';


const UserMessage = bookshelf.model('UserMessage');

const UserMessageFactory = new Factory()
  .attr('text', () => faker.lorem.sentence());

export default UserMessageFactory;

/** Requires sender_id and reciever_id in attrs */
export async function createUserMessage(attrs = {}) {
  return await new UserMessage(UserMessageFactory.build(attrs)).save();
}
