// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN
// ==========================================
const express = require("express");
const cors = require("cors");
const pool = require('./db');       // Base de Datos
const authRoutes = require('./auth'); // Login/Registro/Password

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 2. MIDDLEWARES
// ==========================================
app.use(cors());             
app.use(express.json());     

// Cabeceras anti-bloqueo de Steam
const STEAM_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
};

// ==========================================
// 3. RUTAS DE SISTEMA (Login y Creación Tablas)
// ==========================================
app.use('/api/auth', authRoutes);

// RUTA MAESTRA PARA CREAR/VERIFICAR TODAS LAS TABLAS
// Visita: https://tu-app.onrender.com/crear-tablas-general
app.get('/crear-tablas-general', async (req, res) => {
    try {
        // 1. Tabla Usuarios
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // 2. Tabla Reseñas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                game_id VARCHAR(50) NOT NULL,
                username VARCHAR(50) NOT NULL,
                comment TEXT NOT NULL,
                rating INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // 3. Tabla Wishlist (Lista de Deseados)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS wishlist (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                game_id VARCHAR(50) NOT NULL,
                game_name VARCHAR(255),
                game_image TEXT,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(username, game_id) 
            );
        `);
        res.send("✅ Tablas (Users, Reviews, Wishlist) verificadas correctamente.");
    } catch (error) { res.status(500).send("Error BD: " + error.message); }
});

// ==========================================
// 4. RUTAS DE WISHLIST (ESTAS FALTABAN)
// ==========================================

// Agregar a favoritos
app.post('/api/wishlist/add', async (req, res) => {
    const { username, game_id, game_name, game_image } = req.body;
    try {
        await pool.query(
            'INSERT INTO wishlist (username, game_id, game_name, game_image) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
            [username, game_id, game_name, game_image]
        );
        res.json({ message: "Añadido a lista de deseados" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Eliminar de favoritos
app.delete('/api/wishlist/remove', async (req, res) => {
    const { username, game_id } = req.body;
    try {
        await pool.query(
            'DELETE FROM wishlist WHERE username = $1 AND game_id = $2',
            [username, game_id]
        );
        res.json({ message: "Eliminado de lista de deseados" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Verificar si ya está guardado (Para pintar el corazón)
app.get('/api/wishlist/check/:username/:game_id', async (req, res) => {
    const { username, game_id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM wishlist WHERE username = $1 AND game_id = $2',
            [username, game_id]
        );
        res.json({ is_in_wishlist: result.rows.length > 0 });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Obtener TODA la lista (Para la página wishlist.html)
app.get('/api/wishlist/getall/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM wishlist WHERE username = $1 ORDER BY added_at DESC',
            [username]
        );
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// 5. RUTAS DE RESEÑAS (ESTAS TAMBIÉN)
// ==========================================
app.post('/api/reviews', async (req, res) => {
    const { game_id, username, comment, rating } = req.body;
    if (!game_id || !username || !comment) return res.status(400).json({error: "Faltan datos"});
    try {
        await pool.query(
            'INSERT INTO reviews (game_id, username, comment, rating) VALUES ($1, $2, $3, $4)',
            [game_id, username, comment, rating]
        );
        res.json({ message: "Reseña guardada" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/reviews/:game_id', async (req, res) => {
    const { game_id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM reviews WHERE game_id = $1 ORDER BY created_at DESC', [game_id]);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// 6. RUTAS DE STEAM API (Juegos)
// ==========================================

// A. Detalle
app.get("/api/game/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const infoRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`, { headers: STEAM_HEADERS });
    const infoData = await infoRes.json();

    if (!infoData || !infoData[id] || !infoData[id].success) throw new Error("Steam bloqueó o ID inválido");

    const reviewRes = await fetch(`https://store.steampowered.com/appreviews/${id}?json=1&language=spanish&filter=recent`, { headers: STEAM_HEADERS });
    const reviewData = await reviewRes.json();

    const total = reviewData.query_summary?.total_reviews || 1;
    const positivos = reviewData.query_summary?.total_positive || 0;
    const porcentajePositivo = Math.round((positivos / total) * 100);
    
    const reseñas = (reviewData.reviews || []).slice(0, 5).map((r) => ({
      autor: r.author?.steamid || "Anónimo", texto: r.review, votos_positivos: r.votes_up,
    }));

    res.json({
      appid: id,
      name: infoData[id].data.name,
      header_image: infoData[id].data.header_image,
      short_description: infoData[id].data.short_description,
      valoracion: reviewData.query_summary?.review_score_desc || "Sin calificar",
      porcentaje_positivo: porcentajePositivo,
      total_reviews: total,
      reseñas_steam: reseñas,
      genres: infoData[id].data.genres ? infoData[id].data.genres.map(g => g.description) : ["Desconocido"],
    });
  } catch (err) {
    console.error(`❌ Error juego ${id}:`, err.message);
    res.status(500).json({ error: "No se pudo obtener datos de Steam" });
  }
});

// B. Top Juegos (Lista Completa)
app.get("/api/top-games", async (req, res) => {
  try {
    const appIDs = [
      413150, 105600, 883710, 582010, 374320, 1687950, 1817070, 1172470, 252490, 945360, 
      1086940, 1245620, 1174180, 292030, 1593500, 814380, 1091500, 271590, 2050650, 1145360, 620, 367520, 550, 730, 570
    ];
    const juegos = [];

    for (const id of appIDs) {
      try {
          const infoRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`, { headers: STEAM_HEADERS });
          const infoData = await infoRes.json();
          if (!infoData || !infoData[id] || !infoData[id].success) continue; 

          const reviewRes = await fetch(`https://store.steampowered.com/appreviews/${id}?json=1&language=spanish&filter=summary`, { headers: STEAM_HEADERS });
          const reviewData = await reviewRes.json();

          const total = reviewData.query_summary?.total_reviews || 1;
          const positivos = reviewData.query_summary?.total_positive || 0;
          const score = (positivos / total) * 100;

          juegos.push({
            appid: id,
            name: infoData[id].data.name,
            header_image: infoData[id].data.header_image,
            short_description: infoData[id].data.short_description,
            porcentaje_positivo: Math.round(score),
            valoracion: reviewData.query_summary?.review_score_desc || "N/A",
            genres: infoData[id].data.genres ? infoData[id].data.genres.map(g => g.description) : ["Desconocido"],
          });
      } catch (innerErr) { console.error(`Error procesando ${id}:`, innerErr.message); }
    }
    res.json(juegos.sort((a, b) => b.porcentaje_positivo - a.porcentaje_positivo).slice(0, 24));
  } catch (error) { res.json([]); }
});

// ==========================================
// 7. INICIO
// ==========================================
app.listen(PORT, () => { console.log(`🚀 Servidor Full Stack listo en puerto ${PORT}`); });