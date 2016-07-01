import fs from 'fs';
import Promise from 'bluebird';
import { parse } from 'csv';

import knex from './utils/knex';


const asyncParse = Promise.promisify(parse);

async function loadQuotes() {
  const root = await fs.realpathSync(`${__dirname}/..`);
  const csvText = fs.readFileSync(`${root}/quotes.csv`);
  const data = await asyncParse(csvText);

  for (const line of data) {
    const attributes = {
      id: line[0],
      first_name: line[1],
      last_name: line[2],
      avatar_url: line[3],
      text: line[4],
      description: line[5],
      link: line[6]
    };

    try {
      await knex('quotes').insert(attributes);
    } catch (e) {
      await knex('quotes')
        .where({ id: attributes.id })
        .update(attributes);
    }
  }
}

loadQuotes()
  .then(() => {
    process.stdout.write("=== DONE ===\n");
    process.exit();
  })
  .catch(e => {
    console.error(e.stack);  // eslint-disable-line no-console
    process.exit(1);
  });
