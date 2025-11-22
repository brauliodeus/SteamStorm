// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN
// ==========================================
const express = require("express");
const cors = require("cors");
const pool = require('./db');       // Importamos la conexión a la Base de Datos
const authRoutes = require('./auth'); // Importamos las rutas de Login y Registro

// Configuración para usar 'fetch' en versiones modernas de Node.js
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// Configuración del puerto (Render asigna uno automáticamente en process.env.PORT)
const PORT = process.env.PORT || 3000;

// ==========================================
// 2. MIDDLEWARES (OBLIGATORIOS)
// ==========================================
// Permite que el frontend (UCT) se comunique con el backend
app.use(cors());             
// Permite leer los datos JSON que vienen en las peticiones (Login, Reseñas, etc.)
app.use(express.json());     

// ==========================================
// 3. RUTAS DE SISTEMA Y BASE DE DATOS
// ==========================================

// A. Conectar las rutas de autenticación
app.use('/api/auth', authRoutes);

// B. Ruta para crear la tabla de USUARIOS (Ejecutar una vez)
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
        res.send("✅ Tabla 'users' verificada/creada correctamente.");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al crear tabla users: " + error.message);
    }
});

// C. Ruta para crear la tabla de RESEÑAS (Ejecutar una vez)
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
        res.send("✅ Tabla 'reviews' verificada/creada correctamente.");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al crear tabla reviews: " + error.message);
    }
});

// ==========================================
// 4. RUTAS DE RESEÑAS (INTERNAS)
// ==========================================

// Guardar una nueva reseña en la base de datos
app.post('/api/reviews', async (req, res) => {
    const { game_id, username, comment, rating } = req.body;
    
    // Validación simple
    if (!game_id || !username || !comment || !rating) {
        return res.status(400).json({ message: "Faltan datos para la reseña" });
    }

    try {
        await pool.query(
            'INSERT INTO reviews (game_id, username, comment, rating) VALUES ($1, $2, $3, $4)',
            [game_id, username, comment, rating]
        );
        res.json({ message: "Reseña guardada exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Leer todas las reseñas de un juego específico
app.get('/api/reviews/:game_id', async (req, res) => {
    const { game_id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM reviews WHERE game_id = $1 ORDER BY created_at DESC',
            [game_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 5. RUTAS DE API STEAM (EXTERNAS)
// ==========================================

// A. Obtener detalles completos de un juego por ID
app.get("/api/game/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Pedimos información básica del juego a Steam
    const infoRes = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`
    );
    const infoData = await infoRes.json();

    // 2. Pedimos las reseñas recientes a Steam para calcular valoración
    const reviewRes = await fetch(
      `https://store.steampowered.com/appreviews/${id}?json=1&language=spanish&filter=recent`
    );
    const reviewData = await reviewRes.json();

    // Verificamos si Steam devolvió datos válidos
    if (!infoData[id]?.success || !infoData[id]?.data) {
      throw new Error("Datos no válidos recibidos de Steam (info)");
    }

    // Cálculos de valoración
    const total = reviewData.query_summary?.total_reviews || 1;
    const positivos = reviewData.query_summary?.total_positive || 0;
    const porcentajePositivo = Math.round((positivos / total) * 100);

    // Mapeamos algunas reseñas de ejemplo de Steam
    const reseñasSteam = (reviewData.reviews || []).slice(0, 5).map((r) => ({
      autor: r.author?.steamid || "Anónimo",
      texto: r.review,
      votos_positivos: r.votes_up,
    }));

    // Construimos el objeto final limpio para el frontend
    const data = {
      appid: id,
      name: infoData[id].data.name,
      header_image: infoData[id].data.header_image,
      short_description: infoData[id].data.short_description,
      valoracion: reviewData.query_summary?.review_score_desc || "Sin calificar",
      porcentaje_positivo: porcentajePositivo,
      total_reviews: total,
      reseñas_steam: reseñasSteam,
      genres: infoData[id].data.genres
        ? infoData[id].data.genres.map(g => g.description)
        : ["Desconocido"],
    };

    res.json(data);

  } catch (err) {
    console.error("❌ Error al obtener juego:", err.message);
    res.status(500).json({ error: "Error al obtener datos del juego desde Steam" });
  }
});

// B. Obtener lista de Top Juegos (Mejor valorados)
app.get("/api/top-games", async (req, res) => {
  try {
    // Lista manual de IDs de juegos populares para mostrar en la home
    const appIDs = [
      1091500, // Cyberpunk 2077
      1174180, // Red Dead Redemption 2
      1086940, // Baldur's Gate 3
      1144200, // Ready or Not
      220,     // Half-Life 2
      292030,  // The Witcher 3
      1245620, // Elden Ring
      1623730, // Lethal Company
      381210,  // Dead by Daylight
      550      // Left 4 Dead 2
    ];

    const juegos = [];

    // Iteramos sobre cada ID para buscar sus datos
    for (const id of appIDs) {
      // Obtenemos reseñas para calcular el score
      const reviewRes = await fetch(
        `https://store.steampowered.com/appreviews/${id}?json=1&language=spanish&filter=summary`
      );
      const reviewData = await reviewRes.json();

      // Obtenemos info básica (nombre, imagen)
      const infoRes = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`
      );
      const infoData = await infoRes.json();

      // Si ambos datos existen, agregamos a la lista
      if (infoData[id]?.success && reviewData?.query_summary) {
        const total = reviewData.query_summary.total_reviews || 1;
        const positivos = reviewData.query_summary.total_positive || 0;
        const score = (positivos / total) * 100;

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

    // Ordenamos los juegos por mejor valoración y devolvemos los top 6
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
// 6. INICIO DEL SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor SteamStorm corriendo en el puerto ${PORT}`);
});