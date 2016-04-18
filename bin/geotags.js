#!/usr/bin/env babel-node
import knex from './utils/knex';
import slug from 'slug';
import { bulkUpsert, getUpsertQuery } from './utils/query';


async function planets() {
  // Add the Earth geotag.
  await knex.raw(
    getUpsertQuery(
      'geotags',
      {
        type: 'Planet',
        name: 'Earth'
      },
      {
        name: 'Earth',
        type: 'Planet',
        url_name: 'Earth'
      }
    )
  );
}

async function continents() {
  let continentAttributes = [
    {code: 'AF', name: 'Africa'},
    {code: 'AS', name: 'Asia'},
    {code: 'EU', name: 'Europe'},
    {code: 'NA', name: 'North America'},
    {code: 'OC', name: 'Oceania'},
    {code: 'SA', name: 'South America'},
    {code: 'AN', name: 'Antarctica'}
  ].map(attrs => {
    return {
      continent_code: attrs.code,
      name: attrs.name,
      type: 'Continent',
      url_name: slug(attrs.name)
    };
  });

  return bulkUpsert('geotags', continentAttributes, attrs => {
    return {continent_code: attrs.continent_code, type: 'Continent'};
  });
}

async function countries() {
  const continents = await knex('geotags').where({type: 'Continent'});

  const geonamesCountries = await knex
    .select('id', 'name', 'continent', 'iso_alpha2')
    .from('geonames_countries');

  let countryObjects = [];

  for (let country of geonamesCountries) {
    const continent = continents.find(continent => continent.continent_code == country.continent);
    const urlName = slug(country.name);

    countryObjects.push({
      continent_code: country.continent,
      continent_id: continent.id,
      geonames_country_id: country.id,
      country_code: country.iso_alpha2,
      name: country.name,
      type: 'Country',
      url_name: urlName
    });
  }

  return bulkUpsert('geotags', countryObjects, attrs => {
    return {geonames_country_id: attrs.geonames_country_id, type: 'Country'};
  });
}

async function adminDivisions() {
  const countries = await knex('geotags').where({type: 'Country'});

  let adminObjects = [];

  let geonamesAdminDivisions = await knex('geonames_admin1');
  for (let admin of geonamesAdminDivisions) {
    const urlName = slug(admin.name);
    const country = countries.find(country => country.country_code == admin.country_code);

    adminObjects.push({
      admin1_code: admin.code,
      continent_code: country.continent_code,
      continent_id: country.continent_id,
      country_code: country.country_code,
      country_id: country.id,
      geonames_country_id: country.geonames_country_id,
      geonames_admin1_id: admin.id,
      name: admin.name,
      type: 'AdminDivision1',
      url_name: urlName
    });
  }

  return bulkUpsert('geotags', adminObjects, attrs => {
    return {geonames_admin1_id: attrs.geonames_admin1_id, type: 'AdminDivision1'}
  });
}

async function cities() {
  const countries = await knex('geotags').where({type: 'Country'});
  const adminDivisions = await knex('geotags').where({type: 'AdminDivision1'});

  // Create an index of url_name to optimize checking for existence.
  let urlNames = (await knex('geotags').select('url_name').whereNot({type: 'City'}))
    .reduce((acc, geotag) => {
      acc[geotag.url_name] = true;
      return acc;
    }, {});

  function geotagExists(urlName) {
    return urlNames[urlName];
  }

  let geonamesCities = await knex
    .select(knex.raw(`
      cities.id,
      cities.asciiname,
      cities.population,
      cities.country,
      cities.admin1,
      MAX(countries.id) as country_id,
      MAX(countries.name) as country_name
    `))
    .from('geonames_cities as cities')
    .innerJoin('geonames_countries as countries', 'cities.country', 'countries.iso_alpha2')
    .groupBy('cities.id')
    .orderBy('population', 'DESC');

  let cityObjects = [];

  for (let city of geonamesCities) {
    const country = countries.find(country => country.country_code === city.country);

    let admin1 = adminDivisions.find(admin => (
      admin.country_code === city.country && admin.admin1_code === city.admin1
    ));

    // There may be cities without admin1 (admin1 == '00', or empty).
    if (!admin1) {
      admin1 = {
        id: null,
        admin1_code: city.admin1 || '00',
        geonames_admin1_id: null
      };
    }

    const justCity = slug(city.asciiname);
    const cityWithCountry = `${justCity}-${city.admin1}-${slug(city.country_name)}`;
    const cityWithIndex = (i) => `${cityWithCountry}-${i}`;

    // Choose nicer url_name: city or city-state-country or city-state-country-index.
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

    cityObjects.push({
      admin1_code: admin1.admin1_code,
      admin1_id: admin1.id,
      continent_code: country.continent_code,
      continent_id: country.continent_id,
      country_code: country.country_code,
      country_id: country.id,
      geonames_country_id: city.country_id,
      geonames_admin1_id: admin1.geonames_admin1_id,
      geonames_city_id: city.id,
      name: city.asciiname,
      type: 'City',
      url_name: urlName
    });
  }

  return bulkUpsert('geotags', cityObjects, attrs => {
    return {geonames_city_id: attrs.geonames_city_id, type: 'City'}
  });
}

async function geotags() {
  process.stdout.write("=== IMPORTING/UPDATING PLANET GEOTAGS ===\n");
  await planets();
  
  process.stdout.write("=== IMPORTING/UPDATING CONTINENT GEOTAGS ===\n");
  await continents();

  process.stdout.write("=== IMPORTING/UPDATING COUNTRY GEOTAGS ===\n");
  await countries();
  
  process.stdout.write("=== IMPORTING/UPDATING ADMIN DIVISION GEOTAGS ===\n");
  await adminDivisions();
  
  process.stdout.write("=== IMPORTING/UPDATING CITY GEOTAGS ===\n");
  await cities();
}

geotags()
  .then(() => {
    process.stdout.write("=== GEOTAGS DONE ===\n");
    process.exit(0);
  })
  .catch(e => {
    console.error(e.stack);  // eslint-disable-line no-console

  });
