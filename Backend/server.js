// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN
// ==========================================
const express = require("express");
const cors = require("cors");
const pool = require('./db');         // Base de Datos
const authRoutes = require('./auth'); // Auth
const adminAuth = require('./middleware'); // <--- IMPORTANTE: Middleware de Admin

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 2. MIDDLEWARES
// ==========================================
app.use(cors());             
app.use(express.json());     

const STEAM_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
};

// ==========================================
// 3. RUTAS DE SISTEMA
// ==========================================
app.use('/api/auth', authRoutes);

// Ruta Maestra de Tablas
app.get('/crear-tablas-general', async (req, res) => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role VARCHAR(20) DEFAULT 'user', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
        await pool.query(`CREATE TABLE IF NOT EXISTS reviews (id SERIAL PRIMARY KEY, game_id VARCHAR(50) NOT NULL, username VARCHAR(50) NOT NULL, comment TEXT NOT NULL, rating INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
        await pool.query(`CREATE TABLE IF NOT EXISTS wishlist (id SERIAL PRIMARY KEY, username VARCHAR(50) NOT NULL, game_id VARCHAR(50) NOT NULL, game_name VARCHAR(255), game_image TEXT, added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(username, game_id));`);
        res.send("✅ Tablas verificadas (Users, Reviews, Wishlist).");
    } catch (error) { res.status(500).send("Error BD: " + error.message); }
});

// ==========================================
// 4. RUTAS DE ADMIN (RECUPERADAS) 🛡️
// ==========================================

// Eliminar reseña (Solo Admin)
app.delete('/api/admin/reviews/:id', adminAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ message: "Reseña no encontrada" });
        res.json({ message: "Reseña eliminada por el administrador." });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar reseña.');
    }
});

// Ver usuarios (Solo Admin - Opcional)
app.get('/api/admin/users', adminAuth, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, role, created_at FROM users ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) { res.status(500).send('Error del servidor'); }
});

// ==========================================
// 5. RUTAS DE WISHLIST
// ==========================================
app.post('/api/wishlist/add', async (req, res) => {
    const { username, game_id, game_name, game_image } = req.body;
    try {
        await pool.query('INSERT INTO wishlist (username, game_id, game_name, game_image) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING', [username, game_id, game_name, game_image]);
        res.json({ message: "Añadido a wishlist" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/wishlist/remove', async (req, res) => {
    const { username, game_id } = req.body;
    try {
        await pool.query('DELETE FROM wishlist WHERE username = $1 AND game_id = $2', [username, String(game_id)]);
        res.json({ message: "Eliminado de wishlist" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/wishlist/getall/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const result = await pool.query('SELECT * FROM wishlist WHERE username = $1 ORDER BY added_at DESC', [username]);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/wishlist/check/:username/:game_id', async (req, res) => {
    const { username, game_id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM wishlist WHERE username = $1 AND game_id = $2', [username, String(game_id)]);
        res.json({ is_in_wishlist: result.rows.length > 0 });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// 6. RUTAS DE RESEÑAS PÚBLICAS
// ==========================================
app.post('/api/reviews', async (req, res) => {
    const { game_id, username, comment, rating } = req.body;
    if (!game_id || !username || !comment) return res.status(400).json({error: "Faltan datos"});
    try {
        await pool.query('INSERT INTO reviews (game_id, username, comment, rating) VALUES ($1, $2, $3, $4)', [game_id, username, comment, rating]);
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
// 7. RUTAS DE STEAM
// ==========================================
app.get("/api/game/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const infoRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`, { headers: STEAM_HEADERS });
    const infoData = await infoRes.json();
    if (!infoData || !infoData[id] || !infoData[id].success) throw new Error("Steam bloqueó");

    const reviewRes = await fetch(`https://store.steampowered.com/appreviews/${id}?json=1&language=spanish&filter=recent`, { headers: STEAM_HEADERS });
    const reviewData = await reviewRes.json();

    const total = reviewData.query_summary?.total_reviews || 1;
    const positivos = reviewData.query_summary?.total_positive || 0;
    const porcentajePositivo = Math.round((positivos / total) * 100);
    
    const reseñas = (reviewData.reviews || []).slice(0, 5).map((r) => ({
      autor: r.author?.steamid || "Anónimo", texto: r.review, votos_positivos: r.votes_up,
    }));

    res.json({
      appid: id, name: infoData[id].data.name, header_image: infoData[id].data.header_image,
      short_description: infoData[id].data.short_description,
      valoracion: reviewData.query_summary?.review_score_desc || "N/A",
      porcentaje_positivo: porcentajePositivo, total_reviews: total, reseñas_steam: reseñas,
      genres: infoData[id].data.genres ? infoData[id].data.genres.map(g => g.description) : ["Desconocido"],
    });
  } catch (err) { res.status(500).json({ error: "Error Steam" }); }
});

app.get("/api/top-games", async (req, res) => {
  try {
    const appIDs = [413150, 105600, 883710, 582010, 374320, 1687950, 1817070, 1172470, 252490, 945360, 1086940, 1245620, 1174180, 292030, 1593500, 814380, 1091500, 271590, 2050650, 1145360, 620, 367520, 550, 730, 570];
    const juegos = [];
    for (const id of appIDs) {
      try {
          const infoRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`, { headers: STEAM_HEADERS });
          const infoData = await infoRes.json();
          if (!infoData || !infoData[id] || !infoData[id].success) continue; 
          const reviewRes = await fetch(`https://store.steampowered.com/appreviews/${id}?json=1&language=spanish&filter=summary`, { headers: STEAM_HEADERS });
          const reviewData = await reviewRes.json();
          const score = (reviewData.query_summary.total_positive / (reviewData.query_summary.total_reviews || 1)) * 100;
          juegos.push({
            appid: id, name: infoData[id].data.name, header_image: infoData[id].data.header_image,
            short_description: infoData[id].data.short_description, porcentaje_positivo: Math.round(score),
            valoracion: reviewData.query_summary?.review_score_desc || "N/A",
            genres: infoData[id].data.genres ? infoData[id].data.genres.map(g => g.description) : ["Desconocido"],
          });
      } catch (e) { console.log(e.message); }
    }
    res.json(juegos.sort((a, b) => b.porcentaje_positivo - a.porcentaje_positivo).slice(0, 24));
  } catch (error) { res.json([]); }
});

// ==========================================
// 8. INICIO
// ==========================================
app.listen(PORT, () => { console.log(`🚀 Servidor listo en puerto ${PORT}`); });