// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN
// ==========================================
const express = require("express");
const cors = require("cors");
const pool = require('./db');       // Conexión a la Base de Datos
const authRoutes = require('./auth'); // Rutas de Login/Registro

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 2. MIDDLEWARES
// ==========================================
app.use(cors());             
app.use(express.json());     

// Cabeceras para evitar que Steam bloquee el servidor
const STEAM_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
};

// ==========================================
// 3. RUTAS DE SISTEMA (Login y Tablas)
// ==========================================
app.use('/api/auth', authRoutes);

// Crear tabla de Usuarios
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
        res.send("✅ Tabla 'users' lista.");
    } catch (error) { res.status(500).send("Error BD: " + error.message); }
});

// Crear tabla de Reseñas
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
        res.send("✅ Tabla 'reviews' lista.");
    } catch (error) { res.status(500).send("Error BD Reviews: " + error.message); }
});

// ==========================================
// 4. RUTAS DE RESEÑAS (COMENTARIOS)
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
        const result = await pool.query(
            'SELECT * FROM reviews WHERE game_id = $1 ORDER BY created_at DESC',
            [game_id]
        );
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// 5. RUTAS DE STEAM API
// ==========================================

// A. Detalle de un juego
app.get("/api/game/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const infoRes = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`,
        { headers: STEAM_HEADERS }
    );
    const infoData = await infoRes.json();

    if (!infoData || !infoData[id] || !infoData[id].success) {
        throw new Error("Steam bloqueó la petición o ID inválido");
    }

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
    res.status(500).json({ error: "No se pudo obtener datos de Steam" });
  }
});

// B. Top Juegos
app.get("/api/top-games", async (req, res) => {
  try {
    const appIDs = [
      // --- NUEVOS AÑADIDOS ---
      413150,  // Stardew Valley
      105600,  // Terraria
      883710,  // Resident Evil 2
      582010,  // Monster Hunter: World
      374320,  // Dark Souls III
      1687950, // Persona 5 Royal
      1817070, // Spider-Man Remastered
      1172470, // Apex Legends
      252490,  // Rust
      945360,  // Among Us
      1086940, // Baldur's Gate 3
      1245620, // Elden Ring
      1174180, // Red Dead Redemption 2
      292030,  // The Witcher 3
      1593500, // God of War
      814380,  // Sekiro
      1091500, // Cyberpunk 2077
      271590,  // GTA V
      2050650, // RE4 Remake
      1145360, // Hades
      620,     // Portal 2
      367520,  // Hollow Knight
      550,     // Left 4 Dead 2
      730,     // CS:GO
      570      // Dota 2
    ];

    const juegos = [];

    for (const id of appIDs) {
      try {
          const infoRes = await fetch(
            `https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`,
            { headers: STEAM_HEADERS }
          );
          const infoData = await infoRes.json();

          if (!infoData || !infoData[id] || !infoData[id].success) {
              console.log(`⚠️ Salto ID ${id} (Bloqueo o error)`);
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
          console.error(`Error procesando juego ${id}:`, innerErr.message);
      }
    }

    const mejores = juegos
      .sort((a, b) => b.porcentaje_positivo - a.porcentaje_positivo)
      .slice(0, 24);

    res.json(mejores);

  } catch (error) {
    console.error("❌ Error global Top Juegos:", error.message);
    res.json([]);
  }
});

// ==========================================
// 6. INICIO
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});