const env = process.env;

const config = {
    db: {
        host: env.DB_HOST || "sql12.freesqldatabase.com",
        user: env.DB_USER || "sql12302553",
        password: env.DB_PASSWORD || "EtPDwIJJ2Z",
        database: env.DB_NAME || `sql12302553`
    },
    env: process.env.NODE_ENV || "dev",
    itemsPerPage: 10
};

module.exports = config;