#!/usr/bin/env babel-node
import request from 'superagent';
import AdmZip from 'adm-zip';
import tmp from 'tmp';
import fs from 'fs';
import http from 'http';
import knex from 'knex';


let exec_env = process.env.DB_ENV || 'development';
let root = fs.realpathSync(`${__dirname}/..`);

let Knex = knex(require(`${root}/knexfile.js`)[exec_env]);

async function countries() {
  let req = await request.get('http://download.geonames.org/export/dump/countryInfo.txt');

  let content_lines = req.text.split("\n");

  content_lines.pop();

  let countries_data = content_lines.slice(51).map((line) => {
    let country_fields = line.split("\t");
    try {
      country_fields.map((field, index) => {
        if(index === 15 || index === 17) {
          country_fields[index] = `'${JSON.stringify(field.split(','))}'`;
        } else if(!field.match(/^\d+$/)) {
          field = field.replace(/'/g, "''");
          country_fields[index] = `'${field}'`;
        }
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

function cities() {
  let tmp_file = tmp.fileSync();

  let output = fs.createWriteStream(tmp_file.name);

  output.on('finish', async function () {
    let zip = new AdmZip(tmp_file.name);

    let content_lines = zip.readAsText("cities1000.txt").split("\n");

    let cities_data = content_lines.map((line) => {
      let city_fields = line.split("\t");
      try {
        city_fields.map((field, index) => {
          field = field.replace(/'/g, "''");
          if(index === 3) {
            city_fields[index] = `'${JSON.stringify(field.split(','))}'`;
          } else if(!field.match(/^\d+$/)) {
            city_fields[index] = `'${field}'`;
          }
        });

        return city_fields;
      } catch (ex) {
        return [];
      }

    });

    cities_data.pop();

    let q = cities_data.map((row) => {
      return `INSERT INTO geonames_cities VALUES (${row.join(',')});`;
    }).join("\n");

    try {
      process.stdout.write("=== TRUNCATING CITIES TABLE ===\n");
      await Knex.raw('TRUNCATE geonames_cities CASCADE');

      process.stdout.write("=== IMPORTING ===\n");
      await Knex.raw(q);
      process.stdout.write("=== CITIES DONE ===\n");

      process.stdout.write("=== TRUNCATING GEOTAGS TABLE ===\n");
      await Knex.raw('TRUNCATE geotags CASCADE');

      process.stdout.write("=== IMPORTING ===\n");
      await geotags();
      process.stdout.write("=== GEOTAGS DONE ===\n");
    } catch (e) {
      console.error(e);  // eslint-disable-line no-console
      process.exit(1);
    }

    process.exit();
  });

  request.get('http://download.geonames.org/export/dump/cities1000.zip').pipe(output);
}

async function geotags() {
  return Promise.all([
    Knex.raw("INSERT INTO geotags (name, place_id, place_type) SELECT name, id, 'geonames_countries' FROM geonames_countries"),
    Knex.raw("INSERT INTO geotags (name, place_id, place_type) SELECT name, id, 'geonames_cities' FROM geonames_cities")
  ]);
}

countries()
  .then(() => {
    process.stdout.write("=== COUNTRIES DONE ===\n");

    cities();
  })
  .catch(e => {
    console.error(e);  // eslint-disable-line no-console
    process.exit(1);
  });
