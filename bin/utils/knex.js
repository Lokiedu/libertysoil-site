import fs from 'fs';
import Knex from 'knex';


const dbEnv = process.env.DB_ENV || 'development';
const root = fs.realpathSync(`${__dirname}/../..`);
const knex = Knex(require(`${root}/knexfile.js`)[dbEnv]);

export const singleConnection = () => {
  const config = require(`${root}/knexfile.js`)[dbEnv];
  const fixedConfig = {
    ...config,
    pool: {
      ...config.pool,
      min: 1,
      max: 1,
    }
  };

  return Knex(fixedConfig);
}

export default knex;
