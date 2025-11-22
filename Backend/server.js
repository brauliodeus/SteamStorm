// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN INICIAL
// ==========================================
const express = require("express");
const cors = require("cors");
const pool = require('./db');       // Conexión a la Base de Datos (PostgreSQL)
const authRoutes = require('./auth'); // Rutas de Login y Registro

// Configuración de node-fetch (necesaria para versiones modernas)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// IMPORTANTE PARA RENDER: Usar el puerto que nos asigne el sistema
const PORT = process.env.PORT || 3000;

// ==========================================
// 2. MIDDLEWARES (Cables de conexión)
// ==========================================
app.use(cors());             // app.use(express.json());     // 

// ==========================================
// 3. RUTAS DE SISTEMA (Login y Base de Datos)
// ==========================================

// A. Conectar las rutas de Autenticación (Login/Registro)
app.use('/api/auth', authRoutes);

// B. RUTA DE UTILIDAD: CREAR TABLA USERS
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
        res.send("✅ ¡ÉXITO! La tabla 'users' ha sido creada en PostgreSQL.");
    } catch (error) {
        console.error(error);
        res.status(500).send("❌ Error al crear tabla: " + error.message);
    }
});

// ==========================================
// 4. RUTAS DE VIDEOJUEGOS (API STEAM)
// ==========================================

// Endpoint: Obtener detalles de un juego por ID
app.get("/api/game/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Obtener info básica
    const infoRes = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`
    );
    const infoData = await infoRes.json();

    // 2. Obtener reseñas
    const reviewRes = await fetch(
      `https://store.steampowered.com/appreviews/${id}?json=1&language=spanish&filter=recent`
    );
    const reviewData = await reviewRes.json();

    // Validaciones
    if (!infoData[id]?.success || !infoData[id]?.data)
      throw new Error("Datos no válidos (info)");
    if (!reviewData?.query_summary)
      throw new Error("Datos no válidos (reviews)");

    // Cálculos
    const total = reviewData.query_summary.total_reviews || 1;
    const porcentajePositivo = Math.round(
      (reviewData.query_summary.total_positive / total) * 100
    );

    const reseñas = (reviewData.reviews || []).slice(0, 5).map((r) => ({
      autor: r.author?.steamid || "Anónimo",
      texto: r.review,
      votos_positivos: r.votes_up,
    }));

    const data = {
      appid: id,
      name: infoData[id].data.name,
      header_image: infoData[id].data.header_image,
      short_description: infoData[id].data.short_description,
      valoracion: reviewData.query_summary.review_score_desc,
      porcentaje_positivo: porcentajePositivo,
      total_reviews: reviewData.query_summary.total_reviews,
      reseñas,
      genres: infoData[id].data.genres
        ? infoData[id].data.genres.map(g => g.description)
        : ["Desconocido"],
    };

    res.json(data);
  } catch (err) {
    console.error("❌ Error al obtener juego:", err.message);
    res.status(500).json({ error: "Error al obtener datos del juego" });
  }
});

// Endpoint: Obtener listado de Top Juegos
app.get("/api/top-games", async (req, res) => {
  try {
    const appIDs = [
      1091500, 1174180, 1086940, 1144200, 220, 
      292030, 1245620, 1623730, 381210, 550,
    ];

    const juegos = [];

    for (const id of appIDs) {
      const reviewRes = await fetch(
        `https://store.steampowered.com/appreviews/${id}?json=1&language=spanish&filter=summary`
      );
      const reviewData = await reviewRes.json();

      const infoRes = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`
      );
      const infoData = await infoRes.json();

      if (infoData[id]?.success && reviewData?.query_summary) {
        const score =
          (reviewData.query_summary.total_positive /
            (reviewData.query_summary.total_reviews || 1)) *
          100;

        juegos.push({
          appid: id,
          name: infoData[id].data.name,
          header_image: infoData[id].data.header_image,
          short_description: infoData[id].data.short_description,
          porcentaje_positivo: Math.round(score),
          valoracion: reviewData.query_summary.review_score_desc,
          genres: infoData[id].data.genres
            ? infoData[id].data.genres.map(g => g.description)
            : ["Desconocido"],
        });
      }
    }

    const mejores = juegos
      .sort((a, b) => b.porcentaje_positivo - a.porcentaje_positivo)
      .slice(0, 6);

    res.json(mejores);
  } catch (error) {
    console.error("❌ Error en Top Juegos:", error.message);
    res.status(500).json({ error: "Error al obtener juegos top." });
  }
});

// ==========================================
// 5. ENCENDER EL SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor SteamStorm listo en puerto ${PORT}`);
});