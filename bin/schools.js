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
  const headers = data[0];
  data.splice(0, 1);

  const assocData = data.map(row => {
    const obj = _.zipObject(headers, row);

    delete obj[''];
    delete obj['-'];

    return obj;
  });

  const userUrlNames = [];

  const insertData = assocData.map(obj => {
    const name = obj['School full official name'].trim().replace('\u200b', '');
    let url_name = slug(name);

    if (userUrlNames.includes(url_name)) {
      const city = obj['City'].trim();
      url_name = slug(`${name} ${city}`);

      let i = 2;
      while (userUrlNames.includes(url_name)) {
        url_name = slug(`${name} ${city} ${++i}`);
      }
    }

    userUrlNames.push(url_name);

    return { name, url_name }
  });

  spinner.text = 'connecting to DB';
  const Knex = knex(knexConfig[exec_env]);

  spinner.text = 'executing DB queries';
  const usedNames = [];

  for (const rowData of insertData) {
    let result = await Knex('schools').first('id').where({url_name: rowData.url_name});

    if (_.isUndefined(result) && !usedNames.includes(rowData.names)) {
      result = await Knex('schools').first('id').where({name: rowData.name})
    }

    usedNames.push(rowData.names);

    if (_.isUndefined(result)) {
      await Knex('schools')
        .insert(rowData);
    } else {
      await Knex('schools')
        .where({ id: result.id })
        .update(rowData);
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
