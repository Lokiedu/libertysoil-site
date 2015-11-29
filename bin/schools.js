#!/usr/bin/env babel-node

import fs from 'fs';

import Promise from 'bluebird';
import { parse } from 'csv';
import _ from 'lodash';
import knex from 'knex';
import slug from 'slug';


let asyncParse = Promise.promisify(parse);

async function action() {
  let exec_env = process.env.DB_ENV || 'development';

  let root = await fs.realpathSync(`${__dirname}/..`);
  let csvText = fs.readFileSync(`${root}/schools.csv`);

  let data = await asyncParse(csvText);

  let headers = data[1];

  data.splice(0, 2);

  let assocData = data.map(row => {
    let obj = _.zipObject(headers, row);

    delete obj[''];
    delete obj['-'];

    return obj;
  });

  let insertData = _.uniq(assocData.map(obj => {
    const name = obj['School full official name'].trim();

    return {
      name: name,
      url_name: slug(name)
    }
  }), 'url_name');

  let Knex = knex(require(`${root}/knexfile.js`)[exec_env]);

  for (let rowData of insertData) {
    try {
      await Knex('schools').insert(rowData);
    } catch (e) {
      await Knex('schools')
        .where('url_name', '=', rowData.url_name)
        .update({ name: rowData.name });
    }
  }
}

action()
  .then(() => {
    process.stdout.write("=== DONE ===\n");
    process.exit();
  })
  .catch(e => {
    console.error(e);  // eslint-disable-line no-console
    process.exit(1);
  });
