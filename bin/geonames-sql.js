#!/usr/bin/env babel-node
import fs from 'fs';

import AdmZip from 'adm-zip';
import fetch from 'node-fetch';
import Knex from 'knex';
import { wait as waitForStream } from 'promise-streams'
import tmp from 'tmp';
import { chunk } from 'lodash';
import slug from 'slug';


let exec_env = process.env.DB_ENV || 'development';
let root = fs.realpathSync(`${__dirname}/..`);

let knex = Knex(require(`${root}/knexfile.js`)[exec_env]);

/**
 * @param {string} table
 * @param {object} condition
 * @param {object} attributes
 * @returns {string} - sql query string
 */
async function createOrUpdate(table, condition, attributes) {
  // TODO: this should be optimized. Per-city select-query in a loop is not a feasible solution
  let result = await knex(table).where(condition);
  let query;

  if (result.length > 0) {
    query = knex(table)
      .where(condition)
      .update(attributes)
      .toString();
  } else {
    query = knex(table)
      .insert(attributes)
      .toString();
  }

  // Knex escapes double quotes that don't need to be escaped (e.g. when using JSON.stringify).
  // TODO: we should consider switching to raw postgres's prepared statements, avoiding Knex AND escaping at all
  // TODO: we should use Postgres 9.5's "upsert" capabilities
  if (knex.VERSION !== '0.10.0') {
    throw new Error(`The code uses string-escaping hack to avoid error in Knex's code. It is not tested with your version of Knex`);
  }

  return query.replace(/\\\\"/g, '\\"') + ';';
}

/**
 * Executes queries in batches.
 * @param {Array} queries - array of sql queries
 * @returns {Promise}
 */
function executeQueries(queries) {
  return Promise.all(
    chunk(queries, 1000).map(batch => {
      return knex.raw(batch.join('\n'));
    })
  );
}

async function countries() {
  process.stdout.write("=== DOWNLOADING COUNTRIES DATA ===\n");
  const response = await fetch('http://download.geonames.org/export/dump/countryInfo.txt');

  process.stdout.write("=== PARSING COUNTRIES DATA ===\n");
  let lines = (await response.text())
    .split('\n');

  let countryQueries = [];

  for (let line of lines) {
    // There can be empty strings and comments. Filter them out.
    if (!line.length || line[0] == '#') {
      continue;
    }

    let attrs = line.split('\t');

    let country = {
      iso_alpha2: attrs[0],
      iso_alpha3: attrs[1],
      iso_numeric: attrs[2],
      fips_code: attrs[3],
      name: attrs[4],
      capital: attrs[5],
      areainsqkm: attrs[6],
      population: attrs[7],
      continent: attrs[8],
      tld: attrs[9],
      currencycode: attrs[10],
      currencyname: attrs[11],
      phone: attrs[12],
      postalcode: attrs[13],
      postalcoderegex: attrs[14],
      languages: JSON.stringify(attrs[15].split(',')),
      neighbors: JSON.stringify(attrs[17].split(','))
    };

    countryQueries.push(await createOrUpdate('geonames_countries', {iso_alpha2: country.iso_alpha2}, country));
  }

  process.stdout.write("=== IMPORTING/UPDATING COUNTRIES ===\n");
  return executeQueries(countryQueries);
}

async function cities() {
  process.stdout.write("=== DOWNLOADING CITIES DATA ===\n");
  let tmpFile = tmp.fileSync();
  let output = fs.createWriteStream(tmpFile.name, {flags: 'w'});

  let response = await fetch('http://download.geonames.org/export/dump/cities1000.zip');
  await waitForStream(response.body.pipe(output));

  process.stdout.write("=== UNPACKING CITIES DATA ===\n");
  let zip = new AdmZip(tmpFile.name);
  let lines = zip.readAsText("cities1000.txt")
    .split('\n');


  process.stdout.write("=== IMPORTING/UPDATING CITIES ===\n");

  let cityQueries = [];

  for (let line of lines) {
    if (!line || !line.length) {
      continue;
    }

    let attrs = line.split('\t');

    let city = {
      id: attrs[0],
      name: attrs[1],
      asciiname: attrs[2],
      alternatenames: JSON.stringify(attrs[3].split(',')),
      latitude: attrs[4],
      longitude: attrs[5],
      fclass: attrs[6],
      fcode: attrs[7],
      country: attrs[8],
      cc2: attrs[9],
      admin1: attrs[10],
      admin2: attrs[11],
      admin3: attrs[12],
      admin4: attrs[13],
      population: attrs[14],
      elevation: attrs[15],
      gtopo30: attrs[16],
      timezone: attrs[17],
      moddate: attrs[18]
    };

    cityQueries.push(await createOrUpdate('geonames_cities', {id: city.id}, city));
  }

  return executeQueries(cityQueries);
}

/**
 * Populates the geotags table with the data from geonames_countries and geonames_cities.
 */
async function geotags() {
  // An index of url_name to optimize checking for existence.
  let urlNames = {};
  // Country id => continent code
  let countryContinents = {};

  function geotagExists(urlName) {
    return urlNames[urlName];
  }

  // Add the Earth geotag.
  await knex.raw(
    await createOrUpdate(
      'geotags',
      {
        country_id: null,
        city_id: null,
        name: 'Earth'
      },
      {
        name: 'Earth',
        type: 'Planet',
        url_name: 'Earth'
      }
    )
  );
  urlNames['Earth'] = true;

  process.stdout.write("=== IMPORTING/UPDATING CONTINENT GEOTAGS ===\n");

  let continents = [
    {code: 'AF', name: 'Africa'},
    {code: 'AS', name: 'Asia'},
    {code: 'EU', name: 'Europe'},
    {code: 'NA', name: 'North America'},
    {code: 'OC', name: 'Oceania'},
    {code: 'SA', name: 'South America'},
    {code: 'AN', name: 'Antarctica'}
  ];

  for (let continent of continents) {
    urlNames[continent.name] = true;

    await knex.raw(
      await createOrUpdate(
        'geotags',
        {
          continent: continent.code,
          type: 'Continent'
        },
        {
          continent: continent.code,
          name: continent.name,
          type: 'Continent',
          url_name: slug(continent.name)
        }
      )
    );
  }

  process.stdout.write("=== IMPORTING/UPDATING COUNTRY GEOTAGS ===\n");

  let countries = await knex
    .select('id', 'name', 'continent', 'iso_alpha2')
    .from('geonames_countries');

  let countryQueries = [];

  for (let country of countries) {
    let urlName = slug(country.name);

    urlNames[urlName] = true;
    countryContinents[country.iso_alpha2] = country.continent;

    countryQueries.push(
      await createOrUpdate(
        'geotags',
        {country_id: country.id, city_id: null},
        {
          continent: country.continent,
          country_id: country.id,
          name: country.name,
          type: 'Country',
          url_name: urlName
        }
      )
    );
  }

  await executeQueries(countryQueries);

  process.stdout.write("=== IMPORTING/UPDATING CITY GEOTAGS ===\n");

  let cities = await knex
    .select(
      'cities.id',
      'cities.asciiname as name',
      'cities.population',
      'cities.country',
      'countries.id as country_id',
      'countries.name as country_name'
    )
    .from('geonames_cities as cities')
    .innerJoin('geonames_countries as countries', 'cities.country', 'countries.iso_alpha2')
    .orderBy('population', 'DESC');

  let cityQueries = [];

  for (let city of cities) {
    let justCity = slug(city.name);
    let cityWithCountry = `${justCity}-${slug(city.country_name)}`;
    let cityWithIndex = (i) => `${cityWithCountry}-${i}`;

    // Choose nicer url_name: city or city-country or city-country-index.
    let urlName;

    if (!geotagExists(justCity)) {
      urlName = justCity;
    } else if (!geotagExists(cityWithCountry)) {
      urlName = cityWithCountry;
    } else {
      let index = 1;

      do {
        urlName = cityWithIndex(index);
        ++index;
      } while (geotagExists(urlName));
    }

    urlNames[urlName] = true;

    cityQueries.push(
      await createOrUpdate(
        'geotags',
        {city_id: city.id},
        {
          continent: countryContinents[city.country],
          country_id: city.country_id,
          city_id: city.id,
          name: city.name,
          type: 'City',
          url_name: urlName
        }
      )
    );
  }

  await executeQueries(cityQueries);
}

countries()
  .then(() => {
    process.stdout.write("=== COUNTRIES DONE ===\n");
    return cities();
  })
  .then(() => {
    process.stdout.write("=== CITIES DONE ===\n");
    return geotags();
  })
  .then(() => {
    process.stdout.write("=== GEOTAGS DONE ===\n");
    process.exit(0);
  })
  .catch(e => {
    console.error(e);  // eslint-disable-line no-console
    process.exit(1);
  });
