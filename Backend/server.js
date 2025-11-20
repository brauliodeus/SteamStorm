// ====== CONFIGURACIÓN DEL SERVIDOR ======
const express = require("express");
const cors = require("cors");
const pool = require('./db'); // Importamos la DB para la ruta de crear tabla
const authRoutes = require('./auth'); // <--- IMPORTANTE: Importamos tus rutas de login

// Configuración para fetch (versiones nuevas de node-fetch)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// --- CAMBIO CRÍTICO PARA RENDER ---
// Render te asigna un puerto aleatorio en process.env.PORT
const PORT = process.env.PORT || 3000; 

// Permite que cualquier origen acceda (útil para evitar problemas CORS al inicio)
app.use(cors());
app.use(express.json());

// ====== RUTAS DE AUTENTICACIÓN (LOGIN/REGISTRO) ======
// Esto conecta tu archivo auth.js con el servidor
app.use('/api/auth', authRoutes);

// ====== RUTA MÁGICA: CREAR TABLA EN POSTGRES ======
// Visita /crear-tabla una sola vez tras el deploy para configurar la DB
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
        res.send("✅ ¡Tabla 'users' creada con éxito en PostgreSQL!");
    } catch (error) {
        console.error(error);
        res.status(500).send("❌ Error al crear tabla: " + error.message);
    }
});

// ====== ENDPOINT: Datos de un juego individual (STEAM) ======
app.get("/api/game/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // console.log(`🟢 Solicitando datos de Steam para ID: ${id}`); // Opcional para limpiar logs

    const infoRes = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`
    );
    const infoData = await infoRes.json();

    const reviewRes = await fetch(
      `https://store.steampowered.com/appreviews/${id}?json=1&language=spanish&filter=recent`
    );
    const reviewData = await reviewRes.json();

    if (!infoData[id]?.success || !infoData[id]?.data)
      throw new Error("Datos no válidos (info)");
    if (!reviewData?.query_summary)
      throw new Error("Datos no válidos (reviews)");

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
    console.error("❌ Error detallado:", err.message);
    res.status(500).json({ error: "Error al obtener datos" });
  }
});

// ====== ENDPOINT: Juegos mejor valorados (STEAM) ======
app.get("/api/top-games", async (req, res) => {
  try {
    // console.log("🟢 Obteniendo juegos más valorados...");

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
    console.error("❌ Error al obtener juegos top:", error.message);
    res.status(500).json({ error: "Error al obtener juegos top." });
  }
});

// ====== INICIO DEL SERVIDOR ======
app.listen(PORT, () => {
  console.log(`🚀 Servidor SteamStorm corriendo en el puerto ${PORT}`);
});