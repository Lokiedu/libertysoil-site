#!/usr/bin/env babel-node
import fs from 'fs';

import AdmZip from 'adm-zip';
import fetch from 'node-fetch';
import knex from 'knex';
import { wait as waitForStream } from 'promise-streams'
import tmp from 'tmp';
import { chunk } from 'lodash';
import slug from 'slug';


let exec_env = process.env.DB_ENV || 'development';
let root = fs.realpathSync(`${__dirname}/..`);

let Knex = knex(require(`${root}/knexfile.js`)[exec_env]);

async function countries() {
  process.stdout.write("=== DOWNLOADING COUNTRIES DATA ===\n");
  const response = await fetch('http://download.geonames.org/export/dump/countryInfo.txt');

  process.stdout.write("=== PARSING COUNTRIES DATA ===\n");
  let content_lines = (await response.text()).split("\n");
  content_lines.pop();

  let countries_data = content_lines.slice(51).map((line) => {
    try {
      let country_fields = line.split("\t").map((field, index) => {
        if (index === 15 || index === 17) {
          return `'${JSON.stringify(field.split(','))}'`;
        }

        if (!field.match(/^\d+$/)) {
          field = field.replace(/'/g, "''");
          return `'${field}'`;
        }

        return field;
      });

      country_fields.splice(16, 1);
      country_fields.pop();

      return country_fields;
    } catch (ex) {
      return [];
    }
  });

  let q = countries_data.map((row) => {
    return `INSERT INTO geonames_countries VALUES (${row.join(',')});`;
  }).join("\n");

  process.stdout.write("=== TRUNCATING COUNTRIES TABLE ===\n");
  await Knex.raw('TRUNCATE geonames_countries CASCADE');

  process.stdout.write("=== IMPORTING ===\n");
  await Knex.raw(q);
}

async function cities() {
  process.stdout.write("=== DOWNLOADING CITIES DATA ===\n");
  const tmp_file = tmp.fileSync();
  const output = fs.createWriteStream(tmp_file.name, {flags: 'w'});

  const response = await fetch('http://download.geonames.org/export/dump/cities1000.zip');
  await waitForStream(response.body.pipe(output));

  process.stdout.write("=== UNPACKING CITIES DATA ===\n");
  const zip = new AdmZip(tmp_file.name);
  const content_lines = zip.readAsText("cities1000.txt").split("\n");

  process.stdout.write("=== PARSING CITIES DATA ===\n");
  let cities_data = content_lines.map((line) => {
    try {
      return line.split("\t").map((originalField, index) => {
        const field = originalField.replace(/'/g, "''");

        if (index === 3) {
          return `'${JSON.stringify(field.split(','))}'`;
        }

        if (!field.match(/^\d+$/)) {
          return `'${field}'`;
        }

        return originalField;
      });
    } catch (ex) {
      console.warn(`ERROR while parsing city-data line`, ex);  // eslint-disable-line no-console
      return [];
    }
  });

  cities_data.pop();

  const q = cities_data.map((row) => {
    return `INSERT INTO geonames_cities VALUES (${row.join(',')});`;
  });

  process.stdout.write("=== TRUNCATING CITIES TABLE ===\n");
  await Knex.raw('TRUNCATE geonames_cities CASCADE');

  process.stdout.write("=== IMPORTING ===\n");
  for (let batch of chunk(q, 1000)) {
    await Knex.raw(batch.join("\n"));
  }
}

/**
 * Populates the geotags table with the data from geonames_countries and geonames_cities.
 */
async function geotags() {
  // An index of url_name to optimize checking for existence.
  let urlNames = {};

  function geotagExists(urlName) {
    return urlNames[urlName];
  }

  process.stdout.write("=== TRUNCATING GEOTAGS TABLE ===\n");
  await Knex.raw('TRUNCATE geotags CASCADE');

  process.stdout.write("=== IMPORTING COUNTRY GEOTAGS ===\n");

  let countries = await Knex
    .select('id', 'name')
    .from('geonames_countries');

  let countryAttributes = countries.map(function (country) {
    let urlName = slug(country.name);

    urlNames[urlName] = true;

    return {name: country.name, country_id: country.id, url_name: urlName};
  });

  await Knex('geotags').insert(countryAttributes);

  process.stdout.write("=== IMPORTING CITY GEOTAGS ===\n");

  let cities = await Knex
    .select(
      'cities.id',
      'cities.asciiname as name',
      'cities.population',
      'countries.id as country_id',
      'countries.name as country_name'
    )
    .from('geonames_cities as cities')
    .innerJoin('geonames_countries as countries', 'cities.country', 'countries.iso_alpha2')
    .orderBy('population', 'DESC');

  let cityAttributes = cities.map(function (city) {
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

    return {name: city.name, country_id: city.country_id, city_id: city.id, url_name: urlName};
  });

  for (let batch of chunk(cityAttributes, 1000)) {
    await Knex('geotags').insert(batch);
  }
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
