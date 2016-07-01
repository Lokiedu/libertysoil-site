#!/usr/bin/env babel-node
import fs from 'fs';

import AdmZip from 'adm-zip';
import fetch from 'node-fetch';
import { wait as waitForStream } from 'promise-streams';
import tmp from 'tmp';
import { bulkUpsert } from './utils/query';


async function countries() {
  process.stdout.write("=== DOWNLOADING COUNTRIES DATA ===\n");
  const response = await fetch('http://download.geonames.org/export/dump/countryInfo.txt');

  process.stdout.write("=== PARSING COUNTRIES DATA ===\n");
  const lines = (await response.text())
    .split('\n');

  const objects = [];

  for (const line of lines) {
    // There can be empty strings and comments. Filter them out.
    if (!line.length || line[0] == '#') {
      continue;
    }

    const attrs = line.split('\t');

    objects.push({
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
      id: attrs[16],
      neighbors: JSON.stringify(attrs[17].split(','))
    });
  }

  process.stdout.write("=== IMPORTING/UPDATING COUNTRIES ===\n");
  return bulkUpsert('geonames_countries', objects, attrs => {
    return { iso_alpha2: attrs.iso_alpha2 };
  });
}

async function adminDivisions() {
  process.stdout.write("=== DOWNLOADING ADMIN DIVISIONS DATA ===\n");
  const response = await fetch('http://download.geonames.org/export/dump/admin1CodesASCII.txt');

  process.stdout.write("=== PARSING ADMIN DIVISIONS DATA ===\n");
  const lines = (await response.text())
    .split('\n');

  const objects = [];

  for (const line of lines) {
    if (!line.length) {
      continue;
    }

    const attrs = line.split('\t');
    const [countryCode, code] = attrs[0].split('.');

    objects.push({
      id: attrs[3],
      asciiname: attrs[2],
      code,
      name: attrs[1],
      country_code: countryCode
    });
  }

  process.stdout.write("=== IMPORTING/UPDATING ADMIN DIVISIONS ===\n");
  return bulkUpsert('geonames_admin1', objects, attrs => {
    return { id: attrs.id };
  });
}

async function cities() {
  process.stdout.write("=== DOWNLOADING CITIES DATA ===\n");
  const tmpFile = tmp.fileSync();
  const output = fs.createWriteStream(tmpFile.name, { flags: 'w' });

  const response = await fetch('http://download.geonames.org/export/dump/cities1000.zip');
  await waitForStream(response.body.pipe(output));

  process.stdout.write("=== UNPACKING CITIES DATA ===\n");
  const zip = new AdmZip(tmpFile.name);
  const lines = zip.readAsText("cities1000.txt")
    .split('\n');

  const objects = [];

  for (const line of lines) {
    if (!line || !line.length) {
      continue;
    }

    const attrs = line.split('\t');

    objects.push({
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
    });
  }

  process.stdout.write("=== IMPORTING/UPDATING CITIES ===\n");
  return bulkUpsert('geonames_cities', objects, attrs => {
    return { id: attrs.id };
  });
}

countries()
  .then(() => {
    process.stdout.write("=== COUNTRIES DONE ===\n");
    return adminDivisions();
  })
  .then(() => {
    process.stdout.write("=== ADMIN DIVISIONS DONE ===\n");
    return cities();
  })
  .then(() => {
    process.stdout.write("=== CITIES DONE ===\n");
    process.exit(0);
  })
  .catch(e => {
    console.error(e.stack);  // eslint-disable-line no-console
    process.exit(1);
  });
