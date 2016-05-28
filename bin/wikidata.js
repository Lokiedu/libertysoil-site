#!/usr/bin/env babel-node
import wdk from 'wikidata-sdk';
import fetch from 'node-fetch';

import knex from './utils/knex';


function getSparqlQuery(options = {}) {
  return `
    SELECT ?item ?itemDescription ?geonamesId
    WHERE {
      ${options.condition} .
      ?item wdt:P1566 ?geonamesId .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
    } OFFSET ${options.offset} LIMIT ${options.limit}
  `;
}

async function bulkUpdate(items) {
  const queries = items
    .map(item => knex.raw(`EXECUTE updateGeotag(?, ?);`, [item.geonames_id, item.more]).toString())
    .join('\n');

  return knex.raw(queries);
}

/**
 * Gets items (geonames_id, description) from wikidata using SPARQL, sets the description for each geotag.
 */
async function importDescriptions(wikidataCondition, batchSize = 1000) {
  let iCurrentBatch = 0;
  let currentOffest = 0;

  while (true) { // eslint-disable-line no-constant-condition
    const sparql = getSparqlQuery({
      condition: wikidataCondition,
      offset: currentOffest,
      limit: batchSize
    });

    process.stdout.write(`Requesting batch ${iCurrentBatch + 1} with LIMIT ${batchSize}\n`);
    const response = await fetch(wdk.sparqlQuery(sparql));
    if (!response.ok) {
      process.stderr.write(`Error ${response.status}. Retrying with smaller LIMIT (was ${batchSize}, now ${batchSize / 2}).`);
      batchSize /= 2;
      continue;
    }

    const json = JSON.parse(await response.text());
    const items = json.results.bindings.map(item => {
      const object = {
        geonames_id: item.geonamesId.value
      };

      object.more = {};
      if (item.itemDescription) {
        object.more.description = item.itemDescription.value;
      }

      return object;
    });

    if (!items.length) {
      break;
    }

    await bulkUpdate(items);

    currentOffest += batchSize;
    ++iCurrentBatch;
  }
}

async function execute() {
  await knex.raw(`PREPARE updateGeotag(integer, jsonb) AS UPDATE geotags SET more = coalesce(more, '{}') || to_jsonb($2) WHERE geonames_id = $1`);

  // wdt:P31 <type> - instance of <type>
  // wdt:P31/wdt:P279* <type> - instance of subclasses of <type>
  const COUNTRY_CONDITION = '?item wdt:P31 wd:Q6256';
  const CITY_CONDITION = '?item wdt:P31 wd:Q515';
  const ADMIN_DIVISION_CONDITION = '?item wdt:P31/wdt:P279* wd:Q10864048';

  process.stdout.write('=== IMPORTING COUNTRY DESCRIPTIONS FROM WIKIDATA ===\n');
  await importDescriptions(COUNTRY_CONDITION);

  process.stdout.write('=== IMPORTING ADMIN DIVISION DESCRIPTIONS FROM WIKIDATA ===\n');
  await importDescriptions(ADMIN_DIVISION_CONDITION);

  process.stdout.write('=== IMPORTING CITY DESCRIPTIONS FROM WIKIDATA ===\n');
  await importDescriptions(CITY_CONDITION);
}

execute()
  .then(() => {
    process.exit(0);
  })
  .catch(e => {
    process.stderr.write(e.stack);  // eslint-disable-line no-console
    process.exit(1);
  });
