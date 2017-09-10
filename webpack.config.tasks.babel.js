import { server_configuration } from 'universal-webpack';

import settings from './tasks-uwsettings';  // eslint-disable-line import/default
import configuration from './webpack/server-config';

global.__SERVER__ = true;

const serverConfiguration = {
  ...configuration,
  entry: {
    "tasks": `${__dirname}/tasks.js`,
  }
};

export default server_configuration(serverConfiguration, settings);
