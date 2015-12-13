import knexLib from 'knex';
import config from '../knexfile';
delete config.test.connection.database;
let knex = knexLib(config.test);

knex.raw('DROP DATABASE libertysoil_test;')
  .then(function() {
    return knex.raw('CREATE DATABASE libertysoil_test;')
      .then(function() {
        knex.destroy();
      });
  });
