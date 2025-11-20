// Archivo temporal: init.js
const pool = require('./db');
const crearTabla = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("¡Tabla 'users' creada con éxito en la nube!");
        process.exit();
    } catch (error) {
        console.log(error);
    }
};
crearTabla();