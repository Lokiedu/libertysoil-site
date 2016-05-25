import { initBookshelfFromKnex } from '../../src/api/db';
import knex from './knex';

const bookshelf = initBookshelfFromKnex(knex);

export default bookshelf;
