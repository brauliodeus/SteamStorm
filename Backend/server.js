// ==========================================
// 1. IMPORTACIONES
// ==========================================
const express = require("express");
const cors = require("cors");
const pool = require('./db');       // Conexión a PostgreSQL
const authRoutes = require('./auth'); // Rutas de Login

// Configuración especial para usar fetch en Node.js
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 2. MIDDLEWARES (Cables vitales)
// ==========================================
app.use(cors());             
app.use(express.json());     

// ==========================================
// 3. RUTAS DE USUARIO (LOGIN / DB)
// ==========================================
app.use('/api/auth', authRoutes);

// Ruta para verificar que la BD está viva
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
        res.send("✅ Base de datos conectada y tabla users verificada.");
    } catch (error) {
        res.status(500).send("Error BD: " + error.message);
    }
});

// ==========================================
// 4. RUTAS DE STEAM (¡ESTO ES LO QUE FALTABA!)
// ==========================================

// A. Obtener un juego individual
app.get("/api/game/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Pedimos info a Steam
    const infoRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`);
    const infoData = await infoRes.json();
    
    const reviewRes = await fetch(`https://store.steampowered.com/appreviews/${id}?json=1&language=spanish&filter=recent`);
    const reviewData = await reviewRes.json();

    if (!infoData[id]?.success || !infoData[id]?.data) throw new Error("Datos no válidos en Steam");

    const total = reviewData.query_summary.total_reviews || 1;
    const porcentajePositivo = Math.round((reviewData.query_summary.total_positive / total) * 100);
    
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
      valoracion: reviewData.query_summary.review_score_desc,
      porcentaje_positivo: porcentajePositivo,
      total_reviews: reviewData.query_summary.total_reviews,
      reseñas,
      genres: infoData[id].data.genres ? infoData[id].data.genres.map(g => g.description) : ["Desconocido"],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener juego de Steam" });
  }
});

// B. Obtener Lista de Top Juegos
app.get("/api/top-games", async (req, res) => {
  try {
    // IDs de juegos populares
    const appIDs = [1091500, 1174180, 1086940, 1144200, 220, 292030, 1245620, 1623730, 381210, 550];
    const juegos = [];

    for (const id of appIDs) {
      const reviewRes = await fetch(`https://store.steampowered.com/appreviews/${id}?json=1&language=spanish&filter=summary`);
      const reviewData = await reviewRes.json();
      
      const infoRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`);
      const infoData = await infoRes.json();

      if (infoData[id]?.success && reviewData?.query_summary) {
        const score = (reviewData.query_summary.total_positive / (reviewData.query_summary.total_reviews || 1)) * 100;
        juegos.push({
          appid: id,
          name: infoData[id].data.name,
          header_image: infoData[id].data.header_image,
          short_description: infoData[id].data.short_description,
          porcentaje_positivo: Math.round(score),
          valoracion: reviewData.query_summary.review_score_desc,
          genres: infoData[id].data.genres ? infoData[id].data.genres.map(g => g.description) : ["Desconocido"],
        });
      }
    }
    res.json(juegos.sort((a, b) => b.porcentaje_positivo - a.porcentaje_positivo).slice(0, 6));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al conectar con Steam" });
  }
});

// ==========================================
// 5. ENCENDER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor Render listo en puerto ${PORT}`);
});