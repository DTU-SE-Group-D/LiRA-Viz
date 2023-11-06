import * as dotenv from 'dotenv';
import * as process from 'process';

dotenv.config();

const {
  DB_LIRAMAP_HOST,
  DB_LIRAMAP_PORT,
  DB_LIRAMAP_NAME,
  DB_LIRAMAP_USER,
  DB_LIRAMAP_PASSWORD,
  DB_GROUPD_HOST,
  DB_GROUPD_PORT,
  DB_GROUPD_NAME,
  DB_GROUPD_USER,
  DB_GROUPD_PASSWORD,
} = process.env;

const BASE_CONFIG = {
  client: 'pg',
  debug: process.env.NESTJS_DEBUG !== 'false',
  useNullAsDefault: true,
  pool: {
    min: 2,
    max: 10,
    createTimeoutMillis: 3000,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
    propagateCreateError: false,
  },
  log: {
    warn(msg: any) {
      console.warn(msg);
    },
    error(msg: any) {
      console.error(msg);
    },
    deprecate(msg: any) {
      console.warn('deprecate:', msg);
    },
    debug(msg: any) {
      console.debug(msg);
    },
  },
};

export const DB_LIRAMAP_CONFIG = {
  ...BASE_CONFIG,
  connection: {
    host: DB_LIRAMAP_HOST,
    port: DB_LIRAMAP_PORT,
    database: DB_LIRAMAP_NAME,
    user: DB_LIRAMAP_USER,
    password: DB_LIRAMAP_PASSWORD,
  },
};

export const DB_GROUPD_CONFIG = {
  ...BASE_CONFIG,
  connection: {
    host: DB_GROUPD_HOST,
    port: DB_GROUPD_PORT,
    database: DB_GROUPD_NAME,
    user: DB_GROUPD_USER,
    password: DB_GROUPD_PASSWORD,
  },
};
