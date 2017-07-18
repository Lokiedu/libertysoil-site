import configuration, { opts } from './base-config';
import RuleGenerator from './rules';


const rules = new RuleGenerator(opts.dev);

const serverConfiguration = { ...configuration };

serverConfiguration.module.rules = [
  ...configuration.module.rules,
  rules.serverJs,
  rules.ejsIndexTemplate
];

export default serverConfiguration;
