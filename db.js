const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // coloque sua URL do Neon aqui no .env
  ssl: {
    rejectUnauthorized: false, // necessário para o Neon funcionar
  },
});

module.exports = pool;
