#!/usr/bin/env babel-node
import fs from 'fs';

import AdmZip from 'adm-zip';
import fetch from 'node-fetch';
import knex from 'knex';
import { wait as waitForStream } from 'promise-streams'
import tmp from 'tmp';
import { chunk } from 'lodash';


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

async function geotags() {
  process.stdout.write("=== TRUNCATING GEOTAGS TABLE ===\n");
  await Knex.raw('TRUNCATE geotags CASCADE');

  process.stdout.write("=== IMPORTING ===\n");
  await Promise.all([
    Knex.raw("INSERT INTO geotags (name, place_id, place_type) SELECT name, id, 'geonames_countries' FROM geonames_countries"),
    Knex.raw("INSERT INTO geotags (name, place_id, place_type) SELECT name, id, 'geonames_cities' FROM geonames_cities")
  ]);
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
