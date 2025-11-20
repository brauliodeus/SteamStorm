const { Pool } = require('pg');
require('dotenv').config();

// Usamos la variable DATABASE_URL que Render nos da automáticamente
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Requerido por Render
    }
});

module.exports = pool;