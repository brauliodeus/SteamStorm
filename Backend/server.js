// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN
// ==========================================
const express = require("express");
const cors = require("cors");
const pool = require('./db');
const authRoutes = require('./auth');
require('dotenv').config(); // Para leer la API Key del .env

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;
const STEAM_KEY = process.env.STEAM_API_KEY; // Tu llave maestra

// ==========================================
// 2. MIDDLEWARES
// ==========================================
app.use(cors());             
app.use(express.json());     

// Función de "dormir" para no saturar a Steam (El secreto anti-bloqueo)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Headers para parecer un navegador real
const STEAM_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
};

// ==========================================
// 3. RUTAS DE SISTEMA
// ==========================================
app.use('/api/auth', authRoutes);

app.get('/crear-tablas-general', async (req, res) => {
    // ... (Mantén tu código de tablas igual, lo resumo para ahorrar espacio)
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS wishlist (id SERIAL PRIMARY KEY, username VARCHAR(50), game_id VARCHAR(50), game_name VARCHAR(255), game_image TEXT, added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(username, game_id));`);
        res.send("Tablas verificadas");
    } catch (e) { res.send(e.message); }
});

// ==========================================
// 4. RUTAS WISHLIST Y REVIEWS (Mantener igual)
// ==========================================
// (Copia tus rutas de wishlist/reviews aquí, no cambian)
app.post('/api/wishlist/add', async (req, res) => { /* ... tu código ... */ });
app.delete('/api/wishlist/remove', async (req, res) => { /* ... tu código ... */ });
app.get('/api/wishlist/getall/:username', async (req, res) => { 
    const { username } = req.params;
    try {
        const result = await pool.query('SELECT * FROM wishlist WHERE username = $1 ORDER BY added_at DESC', [username]);
        res.json(result.rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});
// ... Reviews ...

// ==========================================
// 5. RUTAS DE STEAM (OPTIMIZADAS CON API KEY)
// ==========================================

// A. Detalle de Juego
app.get("/api/game/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Añadimos la key si existe, aunque Store API a veces la ignora
    const keyParam = STEAM_KEY ? `&key=${STEAM_KEY}` : '';
    
    const infoRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish${keyParam}`, { headers: STEAM_HEADERS });
    const infoData = await infoRes.json();

    if (!infoData || !infoData[id] || !infoData[id].success) throw new Error("Steam bloqueó o ID inválido");

    const reviewRes = await fetch(`https://store.steampowered.com/appreviews/${id}?json=1&language=spanish&filter=recent`, { headers: STEAM_HEADERS });
    const reviewData = await reviewRes.json();

    const total = reviewData.query_summary?.total_reviews || 1;
    const positivos = reviewData.query_summary?.total_positive || 0;
    const porcentajePositivo = Math.round((positivos / total) * 100);
    
    // ... Resto de tu lógica de mapeo ...
    res.json({
      appid: id,
      name: infoData[id].data.name,
      header_image: infoData[id].data.header_image,
      short_description: infoData[id].data.short_description,
      valoracion: reviewData.query_summary?.review_score_desc || "Sin calificar",
      porcentaje_positivo: porcentajePositivo,
      genres: infoData[id].data.genres ? infoData[id].data.genres.map(g => g.description) : ["Desconocido"],
    });

  } catch (err) {
    console.error(`❌ Error juego ${id}:`, err.message);
    res.status(500).json({ error: "Error Steam" });
  }
});

// B. Top Juegos (Con FRENO para evitar bloqueos)
app.get("/api/top-games", async (req, res) => {
  try {
    const appIDs = [413150, 105600, 883710, 582010, 374320, 1687950, 1817070, 1172470, 252490, 945360, 1086940, 1245620, 1174180, 292030, 1593500, 814380, 1091500, 271590, 2050650, 1145360, 620, 367520, 550, 730, 570];
    const juegos = [];

    for (const id of appIDs) {
      try {
          // ¡FRENO DE MANO! Esperamos 300ms entre cada juego
          await sleep(300); 

          const keyParam = STEAM_KEY ? `&key=${STEAM_KEY}` : '';
          
          const infoRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish${keyParam}`, { headers: STEAM_HEADERS });
          const infoData = await infoRes.json();

          if (!infoData || !infoData[id] || !infoData[id].success) {
              console.log(`⚠️ Steam bloqueó ID ${id} - Saltando...`);
              continue; 
          }

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

      } catch (innerErr) { console.error(`Error ${id}:`, innerErr.message); }
    }

    res.json(juegos.sort((a, b) => b.porcentaje_positivo - a.porcentaje_positivo).slice(0, 24));

  } catch (error) {
    console.error("❌ Error global:", error.message);
    res.json([]); // Retorna vacío para que el frontend use el Backup
  }
});

app.listen(PORT, () => { console.log(`🚀 Servidor con API Key listo en ${PORT}`); });