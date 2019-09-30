const env = process.env;

const config = {
  db: {
    host: env.DB_HOST || "remotemysql.com",
    user: env.DB_USER || "3d1EYk5tec",
    password: env.DB_PASSWORD || "usyma4q2LJ",
    database: env.DB_NAME || `3d1EYk5tec`
  },
  env: process.env.NODE_ENV || "dev",
  itemsPerPage: 10
};

module.exports = config;
