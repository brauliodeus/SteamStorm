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

// Cabecera para engañar a Steam (Simula ser Chrome)
const STEAM_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
};

// ==========================================
// 3. RUTAS DE USUARIOS Y DB
// ==========================================
app.use('/api/auth', authRoutes);

app.get('/crear-tabla', async (req, res) => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        res.send("✅ Tabla 'users' verificada.");
    } catch (error) { res.status(500).send(error.message); }
});

app.get('/crear-tabla-reviews', async (req, res) => {
    try {
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
        res.send("✅ Tabla 'reviews' creada.");
    } catch (error) { res.status(500).send(error.message); }
});

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
        const result = await pool.query(
            'SELECT * FROM reviews WHERE game_id = $1 ORDER BY created_at DESC',
            [game_id]
        );
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// 4. RUTAS DE STEAM (CON PROTECCIÓN ANTI-FALLO)
// ==========================================

app.get("/api/game/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Pedimos info a Steam (Con Headers falsos)
    const infoRes = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`, 
        { headers: STEAM_HEADERS }
    );
    const infoData = await infoRes.json();

    // 2. Validación estricta: Si Steam devuelve null o error, lanzamos excepción controlada
    if (!infoData || !infoData[id] || !infoData[id].success) {
        throw new Error("Steam bloqueó la petición o el juego no existe");
    }

    // 3. Pedimos reseñas
    const reviewRes = await fetch(
        `https://store.steampowered.com/appreviews/${id}?json=1&language=spanish&filter=recent`,
        { headers: STEAM_HEADERS }
    );
    const reviewData = await reviewRes.json();

    const total = reviewData.query_summary?.total_reviews || 1;
    const positivos = reviewData.query_summary?.total_positive || 0;
    const porcentajePositivo = Math.round((positivos / total) * 100);
    
    const reseñas = (reviewData.reviews || []).slice(0, 5).map((r) => ({
      autor: r.author?.steamid || "Anónimo",
      texto: r.review,
      votos_positivos: r.votes_up,
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
    // Devolvemos un error JSON en lugar de colgar el servidor
    res.status(500).json({ error: "No se pudo obtener datos de Steam (Bloqueo de IP o ID inválido)" });
  }
});

app.get("/api/top-games", async (req, res) => {
  try {
    const appIDs = [1091500, 1174180, 1086940, 1144200, 220, 292030, 1245620, 1623730, 381210, 550];
    const juegos = [];

    for (const id of appIDs) {
      try {
          const infoRes = await fetch(
            `https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`,
            { headers: STEAM_HEADERS }
          );
          const infoData = await infoRes.json();

          // Si este juego falla, lo saltamos y seguimos con el siguiente (continue)
          if (!infoData || !infoData[id] || !infoData[id].success) {
              console.log(`⚠️ Steam bloqueó el ID ${id}, saltando...`);
              continue; 
          }

          const reviewRes = await fetch(
            `https://store.steampowered.com/appreviews/${id}?json=1&language=spanish&filter=summary`,
            { headers: STEAM_HEADERS }
          );
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

      } catch (innerErr) {
          console.error(`Error obteniendo ID ${id}:`, innerErr.message);
      }
    }

    // Si Steam nos bloqueó todo, devolvemos lista vacía en vez de error 500
    res.json(juegos.sort((a, b) => b.porcentaje_positivo - a.porcentaje_positivo).slice(0, 6));

  } catch (error) {
    console.error("❌ Error global en Top Juegos:", error.message);
    res.status(500).json({ error: "Error al obtener juegos top." });
  }
});

// ==========================================
// 5. INICIO
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor SteamStorm BLINDADO corriendo en puerto ${PORT}`);
});