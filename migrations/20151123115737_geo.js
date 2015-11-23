export async function up(knex, Promise) {

  await knex.schema.createTable('geonames_countries', function(table) {
    table.string('iso_alpha2', 2).primary();
    table.string('iso_alpha3', 3);
    table.integer('iso_numeric');
    table.text('fips_code');
    table.text('name');
    table.text('capital');
    table.float('areainsqkm');
    table.integer('population');
    table.text('continent');

    table.text('currencycode');
    table.text('currencyname');
    table.text('phone');
    table.text('postalcode');
    table.text('postalcoderegex');
    table.text('languages');
    table.json('neighbors', true);
    table.json('equivfipscode', true);
  });

  await knex.schema.createTable('geonames_cities', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('name');
    table.text('asciiname');
    table.json('alternatenames', true);
    table.float('latitude');
    table.float('longitude');
    table.text('fclass');
    table.text('fcode');
    table.text('country');
    table.text('cc2');
    table.text('admin1');
    table.text('admin2');
    table.text('admin3');
    table.text('admin4');
    table.integer('population');
    table.integer('elevation');
    table.integer('gtopo30');
    table.text('timezone');
    table.date('moddate');
  });

}

export async function down(knex, Promise) {
  await knex.schema.dropTable('geonames_cities');
  return knex.schema.dropTable('geonames_countries');
}

//Country

/*
 iso_alpha2      CHAR(2),
 iso_alpha3      CHAR(3),
 iso_numeric     INTEGER,
 fips_code       TEXT,
 name            TEXT,
 capital         TEXT,
 areainsqkm      DOUBLE PRECISION,
 population      INTEGER,
 continent       TEXT,
 tld             TEXT,
 currencycode    TEXT,
 currencyname    TEXT,
 phone           TEXT,
 postalcode      TEXT,
 postalcoderegex TEXT,
 languages       TEXT,
 geonameid       INTEGER FOREIGN KEY (geonameid) REFERENCES geonames (geonameid) ON DELETE RESTRICT,
 neighbors       VARCHAR(50),
 equivfipscode   VARCHAR(3)
 */

//City

/*
  geonameid      SERIAL,
  name           VARCHAR(200),
  asciiname      VARCHAR(200),
  alternatenames VARCHAR(10000),
  latitude       FLOAT,
  longitude      FLOAT,
  fclass         CHAR(1),
  fcode          VARCHAR(10),
  country        VARCHAR(2),
  cc2            VARCHAR(100),
  admin1         VARCHAR(20),
  admin2         VARCHAR(80),
  admin3         VARCHAR(20),
  admin4         VARCHAR(20),
  population     BIGINT,
  elevation      INTEGER,
  gtopo30        INTEGER,
  timezone       VARCHAR(40),
  moddate        DATE
 */