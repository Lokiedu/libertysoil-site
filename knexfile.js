// Update with your config settings.

require("babel/register")();

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      host     : '127.0.0.1',
      user     : 'libertysoil',
      password : 'libertysoil',
      database : 'libertysoil',
      charset  : 'utf8'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
