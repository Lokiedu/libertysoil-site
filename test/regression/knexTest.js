/*eslint-env node, mocha */
import expect from 'unexpected';

import initBookshelf from '../../src/api/db';


describe('Knex.js library sanity', () => {
  let bookshelf;
  let knex;

  before(() => {
    bookshelf = initBookshelf(global.$dbConfig);
    knex = bookshelf.knex;
  });

  beforeEach(async () => {
    await knex('geotags').del();
  });

  it('should be capable to execute geotag queries', async () => {
    await knex('geotags').insert({
      id: '8d90fc6e-3fbe-4bb5-8e44-9e20dca7068b',
      name: 'Europe',
      url_name: 'Europe',
      type: 'Continent',
      continent_code: 'EU',
      geonames_country_id: null,
      geonames_city_id: null,
      geonames_admin1_id: null,
      lat: 47,
      lon: 8
    });

    await knex('geotags').insert({
      id: 'f5b5a69e-c223-46dc-a8c9-46fec9fb0166',
      name: 'United Kingdom',
      url_name: 'United-Kingdom',
      type: 'Country',
      continent_code: 'EU',
      geonames_country_id: null,
      geonames_city_id: null,
      geonames_admin1_id: null,
      continent_id: '8d90fc6e-3fbe-4bb5-8e44-9e20dca7068b',
      country_code: 'GB',
      lat: 54,
      lon: -2,
      land_mass: 241930
    });

    const Geotag = bookshelf.model('Geotag');
    const promise = Geotag
      .forge()
      .where('url_name', 'United-Kingdom')
      .fetch({ require: true, withRelated: ['country', 'admin1', 'city', 'continent', 'geonames_city'] });

    return expect(promise, 'to be fulfilled');
  });
});
