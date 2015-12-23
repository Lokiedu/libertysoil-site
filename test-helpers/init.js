// First require your DOM emulation file (see below)
require('./emulateDom.js');

import db_config from '../knexfile';

let exec_env = process.env.DB_ENV || 'test';
global.$dbConfig = db_config[exec_env];
