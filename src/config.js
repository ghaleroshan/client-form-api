const env = process.env;

const config = {
  db: {
    host: env.DB_HOST || "remotemysql.com",
    user: env.DB_USER || "viWl0ZBcRE",
    password: env.DB_PASSWORD || "WOQr6byF81",
    database: env.DB_NAME || `viWl0ZBcRE`
  },
  env: process.env.NODE_ENV || "dev",
  itemsPerPage: 10
};

module.exports = config;
