#!/usr/bin/env babel-node

import fs from 'fs';

import Promise from 'bluebird';
import { parse } from 'csv';
import knex from 'knex';
import _ from 'lodash';
import ora from 'ora';
import slug from 'slug';

import knexConfig from '../knexfile';


const exec_env = process.env.DB_ENV || 'development';
const asyncParse = Promise.promisify(parse);

async function action() {
  const spinner = ora('reading data');
  spinner.start();

  const root = await fs.realpathSync(`${__dirname}/..`);
  const csvText = fs.readFileSync(`${root}/schools.csv`);

  spinner.text = 'parsing data';
  let data = await asyncParse(csvText);

  spinner.text = 'preprocessing data';
  const headers = data[1];
  data.splice(0, 2);

  const assocData = data.map(row => {
    const obj = _.zipObject(headers, row);

    delete obj[''];
    delete obj['-'];

    return obj;
  });

  const insertData = _.uniq(assocData.map(obj => {
    const name = obj['School full official name'].trim();

    return {
      name: name,
      url_name: slug(name)
    }
  }), 'url_name');

  spinner.text = 'connecting to DB';
  const Knex = knex(knexConfig[exec_env]);

  spinner.text = 'executing DB queries';
  for (const rowData of insertData) {
    try {
      await Knex('schools').insert(rowData);
    } catch (e) {
      await Knex('schools')
        .where('url_name', '=', rowData.url_name)
        .update({ name: rowData.name });
    }
  }

  spinner.stop();
}

action()
  .then(() => {
    process.exit();
  })
  .catch(e => {
    console.error(e);  // eslint-disable-line no-console
    process.exit(1);
  });
