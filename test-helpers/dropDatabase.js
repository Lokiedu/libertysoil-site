import knexLib from 'knex';
import config from '../knexfile';


config.test.connection.database = 'libertysoil';
const knex = knexLib(config.test);

async function run() {
  await knex.raw('DROP DATABASE IF EXISTS libertysoil_test;');
  await knex.raw('CREATE DATABASE libertysoil_test;');
}

run()
  .then(function () {
    knex.destroy();
    process.exit(0);
  })
  .catch(e => {
    process.stderr.write(`${e.message}\n`);
    process.stderr.write(`${e.stack}\n`);
    knex.destroy();
    process.exit(1);
  });
