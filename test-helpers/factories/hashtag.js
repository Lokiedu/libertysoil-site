import { Factory } from 'rosie';
const faker = require('faker');


export default new Factory()
  .attr('name', () => faker.company.companyName());
