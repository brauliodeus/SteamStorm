// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN
// ==========================================
const express = require("express");
const cors = require("cors");
const pool = require('./db');
const authRoutes = require('./auth');

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

// RUTA MAESTRA PARA CREAR TODAS LAS TABLAS (INCLUYENDO LA NUEVA DE LIKES)
app.get('/crear-tablas-general', async (req, res) => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role VARCHAR(20) DEFAULT 'user', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
        await pool.query(`CREATE TABLE IF NOT EXISTS reviews (id SERIAL PRIMARY KEY, game_id VARCHAR(50) NOT NULL, username VARCHAR(50) NOT NULL, comment TEXT NOT NULL, rating INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
        await pool.query(`CREATE TABLE IF NOT EXISTS wishlist (id SERIAL PRIMARY KEY, username VARCHAR(50) NOT NULL, game_id VARCHAR(50) NOT NULL, game_name VARCHAR(255), game_image TEXT, added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(username, game_id));`);
        
        // [NUEVA] Tabla de Likes
        await pool.query(`
            CREATE TABLE IF NOT EXISTS review_likes (
                id SERIAL PRIMARY KEY,
                review_id INT NOT NULL,
                username VARCHAR(50) NOT NULL,
                UNIQUE(review_id, username) -- Un usuario solo puede dar 1 like por review
            );
        `);
        
        res.send("✅ Tablas verificadas (Users, Reviews, Wishlist, Likes).");
    } catch (error) { res.status(500).send("Error BD: " + error.message); }
});

// ==========================================
// 4. RUTAS DE LIKES (NUEVO SISTEMA)
// ==========================================

// Dar o Quitar Like (Toggle)
app.post('/api/reviews/like', async (req, res) => {
    const { review_id, username } = req.body;
    try {
        // 1. Verificar si ya dio like
        const check = await pool.query('SELECT * FROM review_likes WHERE review_id = $1 AND username = $2', [review_id, username]);
        
        if (check.rows.length > 0) {
            // Si ya existe, lo BORRAMOS (Quitar like)
            await pool.query('DELETE FROM review_likes WHERE review_id = $1 AND username = $2', [review_id, username]);
            res.json({ action: 'removed' });
        } else {
            // Si no existe, lo AGREGAMOS (Dar like)
            await pool.query('INSERT INTO review_likes (review_id, username) VALUES ($1, $2)', [review_id, username]);
            res.json({ action: 'added' });
        }
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Obtener lista de reviews que "YO" he likeado en este juego (para pintarlos azul)
app.get('/api/user-likes/:game_id/:username', async (req, res) => {
    const { game_id, username } = req.params;
    try {
        // Buscamos los likes de este usuario en reviews de este juego
        const result = await pool.query(`
            SELECT rl.review_id 
            FROM review_likes rl
            JOIN reviews r ON rl.review_id = r.id
            WHERE r.game_id = $1 AND rl.username = $2
        `, [game_id, username]);
        
        // Devolvemos un array simple de IDs: [15, 22, 30...]
        res.json(result.rows.map(row => row.review_id));
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// 5. RUTAS DE RESEÑAS (MODIFICADA PARA CONTAR LIKES)
// ==========================================
app.post('/api/reviews', async (req, res) => {
    const { game_id, username, comment, rating } = req.body;
    if (!game_id || !username || !comment) return res.status(400).json({error: "Faltan datos"});
    try {
        await pool.query('INSERT INTO reviews (game_id, username, comment, rating) VALUES ($1, $2, $3, $4)', [game_id, username, comment, rating]);
        res.json({ message: "Reseña guardada" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Obtener reseñas + Cantidad de Likes
app.get('/api/reviews/:game_id', async (req, res) => {
    const { game_id } = req.params;
    try {
        // Subconsulta para contar los likes de cada reseña
        const query = `
            SELECT r.*, 
            (SELECT COUNT(*) FROM review_likes rl WHERE rl.review_id = r.id)::int as likes_count
            FROM reviews r 
            WHERE r.game_id = $1 
            ORDER BY created_at DESC
        `;
        const result = await pool.query(query, [game_id]);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// [RUTAS DE ADMIN - MANTENIDAS]
app.delete('/api/admin/reviews/:id', require('./middleware'), async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM review_likes WHERE review_id = $1', [id]); // Borrar likes primero
        const result = await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ message: "No encontrado" });
        res.json({ message: "Eliminado." });
    } catch (e) { res.status(500).send(e.message); }
});

// ==========================================
// 6. RUTAS DE WISHLIST (MANTENIDAS)
// ==========================================
app.post('/api/wishlist/add', async (req, res) => {
    const { username, game_id, game_name, game_image } = req.body;
    try {
        await pool.query('INSERT INTO wishlist (username, game_id, game_name, game_image) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING', [username, game_id, game_name, game_image]);
        res.json({ message: "Añadido" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/wishlist/remove', async (req, res) => {
    const { username, game_id } = req.body;
    try {
        await pool.query('DELETE FROM wishlist WHERE username = $1 AND game_id = $2', [username, String(game_id)]);
        res.json({ message: "Eliminado" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/wishlist/getall/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const result = await pool.query('SELECT * FROM wishlist WHERE username = $1 ORDER BY added_at DESC', [username]);
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/wishlist/check/:username/:game_id', async (req, res) => {
    const { username, game_id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM wishlist WHERE username = $1 AND game_id = $2', [username, String(game_id)]);
        res.json({ is_in_wishlist: result.rows.length > 0 });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ==========================================
// 7. RUTAS DE STEAM (MANTENIDAS)
// ==========================================
app.get("/api/game/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const infoRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`, { headers: STEAM_HEADERS });
    const infoData = await infoRes.json();
    if (!infoData || !infoData[id] || !infoData[id].success) throw new Error("Block");
    
    const reviewRes = await fetch(`https://store.steampowered.com/appreviews/${id}?json=1&language=spanish&filter=recent`, { headers: STEAM_HEADERS });
    const reviewData = await reviewRes.json();
    const total = reviewData.query_summary?.total_reviews || 1;
    const positivos = reviewData.query_summary?.total_positive || 0;
    
    res.json({
      appid: id, name: infoData[id].data.name, header_image: infoData[id].data.header_image,
      short_description: infoData[id].data.short_description,
      valoracion: reviewData.query_summary?.review_score_desc || "N/A",
      porcentaje_positivo: Math.round((positivos / total) * 100),
      genres: infoData[id].data.genres ? infoData[id].data.genres.map(g => g.description) : ["Game"],
    });
  } catch (err) { res.status(500).json({ error: "Error" }); }
});

app.get("/api/top-games", async (req, res) => {
  try {
    const appIDs = [413150, 105600, 883710, 582010, 374320, 1687950, 1817070, 1172470, 252490, 945360, 1086940, 1245620, 1174180, 292030, 1593500, 814380, 1091500, 271590, 2050650, 1145360, 620, 367520, 550, 730, 570];
    const juegos = [];
    for (const id of appIDs) {
      try {
          const infoRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`, { headers: STEAM_HEADERS });
          const d = await infoRes.json();
          if (d && d[id] && d[id].success) {
             const rRes = await fetch(`https://store.steampowered.com/appreviews/${id}?json=1&language=spanish&filter=summary`, { headers: STEAM_HEADERS });
             const rD = await rRes.json();
             const score = (rD.query_summary.total_positive / (rD.query_summary.total_reviews || 1)) * 100;
             juegos.push({ appid: id, name: d[id].data.name, header_image: d[id].data.header_image, porcentaje_positivo: Math.round(score), genres: d[id].data.genres.map(g=>g.description) });
          }
      } catch (e) {}
    }
    res.json(juegos.slice(0,24));
  } catch (e) { res.json([]); }
});

app.listen(PORT, () => { console.log(`🚀 Servidor V4 (Likes) listo en ${PORT}`); });