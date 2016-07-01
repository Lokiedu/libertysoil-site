#!/usr/bin/env babel-node

import fs from 'fs';
import { parse as parseUrl } from 'url';

import Promise from 'bluebird';
import { parse } from 'csv';
import knex from 'knex';
import _ from 'lodash';
import ora from 'ora';
import slug from 'slug';

import knexConfig from '../knexfile';


const exec_env = process.env.DB_ENV || 'development';
const asyncParse = Promise.promisify(parse);

const countryMap = {
  "Arab Republic of Egypt": "Egypt",
  "Argentine Republic": "Argentina",
  "Belize": "Belize",
  "Burkina Faso": "Burkina Faso",
  "Canada": "Canada",
  "Commonwealth of Australia": "Australia",
  "Czech Republic": "Czech Republic",
  "Democratic Republic of the Congo": "Democratic Republic of the Congo",
  "Federal Democratic Republic of Ethiopia": "Ethiopia",
  "Federal Democratic Republic of Nepal": "Nepal",
  "Federal Republic of Germany": "Germany",
  "Federative Republic of Brazil": "Brazil",
  "French Republic": "France",
  "Hellenic Republic": "Greece",
  "Hungary": "Hungary",
  "Italian Republic": "Italy",
  "Japan": "Japan",
  "Kingdom of Belgium": "Belgium",
  "Kingdom of Cambodia": "Cambodia",
  "Kingdom of Denmark": "Denmark",
  "Kingdom of Lesotho": "Lesotho",
  "Kingdom of Norway": "Norway",
  "Kingdom of Spain": "Spain",
  "Kingdom of the Netherlands": "Netherlands",
  "New Zealand": "New Zealand",
  "People's Republic of China": "China",
  "Plurinational State of Bolivia": "Bolivia",
  "Portuguese Republic": "Porgugal",
  "Puerto Rico": "Puerto Rico",
  "Republic of Austria": "Austria",
  "Republic of Burundi": "Burundi",
  "Republic of Cameroon": "Cameroon",
  "Republic of Chad": "Chad",
  "Republic of Chile": "Chile",
  "Republic of China": "China",
  "Republic of Colombia": "Colombia",
  "Republic of Costa Rica": "Costa Rica",
  "Republic of Ecuador": "Ecuador",
  "Republic of Finland": "Finland",
  "Republic of Guatemala": "Guatemala",
  "Republic of Honduras": "Honduras",
  "Republic of India": "India",
  "Republic of Kenya": "Kenya",
  "Republic of Korea": "Korea",
  "Republic of Liberia": "Liberia",
  "Republic of Lithuania": "Lithuania",
  "Republic of Madagascar": "Madagascar",
  "Republic of Malawi": "Malawi",
  "Republic of Mozambique": "Mozambique",
  "Republic of Niger": "Niger",
  "Republic of Peru": "Peru",
  "Republic of Poland": "Poland",
  "Republic of Singapore": "Singapore",
  "Republic of South Africa": "South Africa",
  "Republic of Turkey": "Turkey",
  "Republic of Uganda": "Uganda",
  "Republic of the Congo": "Republic of the Congo",
  "Republic of the Philippines": "Philippines",
  "Romania": "Romania",
  "Russian Federation": "Russia",
  "State of Israel": "Israel",
  "State of Palestine": "Palestinian Territory",
  "Swiss Confederation": "Switzerland",
  "Ukraine": "Ukraine",
  "United  States": "United States",
  "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
  "United Mexican States": "Mexico",
  "United States": "United States",
  "United States of America": "United States"
};

const getBool = (str) => {
  if (str === 'Yes') {
    return true;
  }

  if (str === 'No') {
    return false;
  }

  return null;
};

async function action() {
  const spinner = ora('reading data');
  spinner.start();

  const root = await fs.realpathSync(`${__dirname}/..`);
  const csvText = fs.readFileSync(`${root}/schools.csv`);

  spinner.text = 'parsing data';
  const data = await asyncParse(csvText);

  spinner.text = 'connecting to DB';
  const Knex = knex(knexConfig[exec_env]);

  const countryRows = await Knex.select('name', 'id').from('geotags').where({ type: 'Country' });
  const countries = _.mapValues(_.keyBy(countryRows, 'name'), 'id');

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

  const insertData = assocData
    .map(obj => {
      const name = obj['School full official name'].trim().replace('\u200b', '');
      const country = countryMap[obj['Country'].trim()];
      const city = obj['City'].trim();
      const address1 = obj['Street address1'].trim();
      const address2 = obj['Street address2'].trim();
      const house = obj['House address'].trim();
      const postal_code = obj['Post code'].trim();
      const website = obj['Website URL/Name'].trim();

      let url_name = slug(name);

      if (userUrlNames.includes(url_name)) {
        url_name = slug(`${name} ${city}`);

        let i = 2;
        while (userUrlNames.includes(url_name)) {
          url_name = slug(`${name} ${city} ${++i}`);
        }
      }

      if (url_name.match(/[a-z]/gi) === null) {
        const pieces = parseUrl(website).hostname.split('.');

        if (pieces) {
          let maxLength = 0;
          let selectedIdx = 0;

          for (let idx = 0; idx < pieces.length; idx++) {
            if (pieces[idx].length > maxLength) {
              maxLength = pieces[idx].length;
              selectedIdx = idx;
            }
          }

          url_name = slug(pieces[selectedIdx]);
        } else {
          console.warn(`\nCouldn't generate proper urlname for ${name}`); // eslint-disable-line no-console
          return false;
        }
      }

      userUrlNames.push(url_name);

      const country_id = countries[country];
      const is_open = getBool(obj['Currently Running? Open?']);

      const phone = obj['Phone Number'].trim();
      const facebook = obj['Facebook Link'].trim();
      const twitter = obj['Twitter Link'].trim();

      const _principal_name = obj[`Principal's name`].trim();
      const [principal_name, principal_surname] = _principal_name.length > 0 ? _principal_name.split(' ') : ['', ''];

      const foundation_date = obj['Date School Was Founded'].trim();
      let foundation_year = null, foundation_month = null, foundation_day = null;

      if (foundation_date.length === 4) {
        foundation_year = parseInt(foundation_date, 10);
      } else {
        const pieces = foundation_date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);

        if (pieces !== null) {
          foundation_month = parseInt(pieces[1], 10);
          foundation_day = parseInt(pieces[2], 10);
          foundation_year = parseInt(pieces[3], 10);
        }
      }

      const teaching_languages = JSON.stringify(obj['Teaching language'].trim().split(', ').filter(Boolean));

      const org_membership = {};
      {
        const fieldMapper = (field) => {
          if (field === 'Yes') {
            return { is_member: true };
          } else if (field === 'No') {
            return { is_member: false };
          }

          return null;
        };

        const csvToJson = (jsonb_name, csv_name) => {
          const value = obj[csv_name].trim();
          if (value) {
            org_membership[jsonb_name] = fieldMapper(value);
          }
        };

        const keys = {
          'EUDEC Member': 'eudec',
          'AERO Member': 'aero',
          'Wikipedia list of schools entry': 'wikipedia_list',
          'IDEN entry': 'iden',
          'ADEC Entry': 'adec',
          'AlternativeToSchool.com entry': 'alternative_to_school',
          'Australian': 'australian'
        };

        _.forEach(keys, csvToJson);
      }

      return {
        name, url_name,
        is_open,
        country_id, city, address1, address2, house, postal_code,
        website, phone, facebook, twitter,
        teaching_languages,
        foundation_day, foundation_month, foundation_year,
        principal_name, principal_surname,
        org_membership
      };
    })
    .filter(Boolean);

  spinner.text = 'executing DB queries';
  const usedNames = [];

  for (const rowData of insertData) {
    let result = await Knex('schools').first('id').where({ url_name: rowData.url_name });

    if (_.isUndefined(result) && !usedNames.includes(rowData.names)) {
      result = await Knex('schools').first('id').where({ name: rowData.name });
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
