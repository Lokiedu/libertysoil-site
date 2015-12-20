// Update with your config settings.

try {
  require("babel/register")();
} catch(e) {
  // it's ok. might be already enabled
}

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
      max: 10,
      ping: function (conn, cb) {
        conn.query('SELECT 1', cb);
      }
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  test: {
    client: 'postgresql',
    connection: {
      host     : '127.0.0.1',
      user     : 'postgres',
      password : 'postgres',
      database : 'libertysoil_test',
      charset  : 'utf8'
    },
    pool: {
      min: 2,
      max: 10,
      ping: function (conn, cb) {
        conn.query('SELECT 1', cb);
      }
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'postgres',
      user:     'postgres',
      password: 'Laik7akoh2ai',
      host: process.env.DB_PORT_5432_TCP_ADDR,
      port: process.env.DB_PORT_5432_TCP_PORT
    },
    pool: {
      min: 2,
      max: 10,
      ping: function (conn, cb) {
        conn.query('SELECT 1', cb);
      }
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
