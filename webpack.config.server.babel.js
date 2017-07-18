import { server_configuration } from 'universal-webpack';

import settings from './server-uwsettings';  // eslint-disable-line import/default
import configuration from './webpack/server-config';

global.__SERVER__ = true;

const serverConfiguration = {
  ...configuration,
  entry: {
    "server": `${__dirname}/server.js`,
  }
};

export default server_configuration(serverConfiguration, settings);
