export const loadConfig = () => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: +process.env.PORT || 3000,
  DB_NAME: process.env.DB_NAME,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: +process.env.DB_PORT || 5432,
  DB_USERNAME: process.env.DB_USERNAME || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '1h',
  HOST_API: process.env.HOST_API,
  BASE_PATH_API: process.env.BASE_PATH_API,
});
