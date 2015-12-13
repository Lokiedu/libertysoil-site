import knexLib from 'knex';
import config from '../knexfile';


config.test.connection.database = 'libertysoil';
let knex = knexLib(config.test);

async function run() {
  await knex.raw('DROP DATABASE IF EXISTS libertysoil_test;');
  await knex.raw('CREATE DATABASE libertysoil_test;');
}

run()
  .then(function() {
    knex.destroy();
    process.exit(0);
  })
  .catch(e => {
    console.log(e);
    knex.destroy();
    process.exit(1);
  });
