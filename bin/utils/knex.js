import fs from 'fs';
import Knex from 'knex';


const dbEnv = process.env.DB_ENV || 'development';
const root = fs.realpathSync(`${__dirname}/../..`);
const knex = Knex(require(`${root}/knexfile.js`)[dbEnv]);

export default knex;
