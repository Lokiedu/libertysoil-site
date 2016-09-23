import initBookshelf from '../src/api/db';
import dbConfig from '../knexfile';


const dbEnv = process.env.DB_ENV || 'test';
const bookshelf = initBookshelf(dbConfig[dbEnv]);
const knex = bookshelf.knex;

export { bookshelf, knex };
