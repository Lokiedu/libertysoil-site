import { Factory } from 'rosie';
import faker from 'faker';


export default new Factory()
  .attr('name', () => faker.company.companyName());
