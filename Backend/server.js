// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN
// ==========================================
const express = require("express");
const cors = require("cors");
const pool = require('./db');
const authRoutes = require('./auth');
const adminAuth = require('./middleware');
const Groq = require("groq-sdk");

const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 2. MIDDLEWARES
// ==========================================
app.use(cors());
app.use(express.json());

// Inicializar Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const STEAM_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
};

// ==========================================
// 3. RUTAS DE SISTEMA
// ==========================================
app.use('/api/auth', authRoutes);

// --- RUTA DEL CHATBOT (CON GROQ / LLAMA 3) ---
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Eres StormBot, el asistente experto de la plataforma de videojuegos "SteamStorm".
                    Tu misión es recomendar videojuegos y ayudar a los usuarios.
                    
                    Información sobre SteamStorm:
                    - Es una web para ver reseñas, ránkings y guardar juegos en lista de deseados.
                    - Tenemos juegos como Baldur's Gate 3, Elden Ring, Stardew Valley, etc.
                    
                    Responde de forma breve (máximo 3 líneas), divertida y 'gamer'. 
                    Usa emojis. Si te preguntan algo que no sea de juegos, di que solo sabes de gaming.`
                },
                {
                    role: "user",
                    content: message
                }
            ],
            model: "llama3-8b-8192", // Modelo rápido y eficiente
        });

        const reply = completion.choices[0]?.message?.content || "Me quedé sin palabras... 🎮";
        res.json({ reply });

    } catch (error) {
        console.error("❌ Error Groq:", error);
        res.status(500).json({ reply: "¡Lag mental! 😵 Mi procesador falló. Intenta de nuevo." });
    }
});

// ==========================================
// 4. RESTO DE RUTAS 
// ==========================================

// --- TABLAS ---
app.get('/crear-tablas-general', async (req, res) => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role VARCHAR(20) DEFAULT 'user', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
        await pool.query(`CREATE TABLE IF NOT EXISTS reviews (id SERIAL PRIMARY KEY, game_id VARCHAR(50) NOT NULL, username VARCHAR(50) NOT NULL, comment TEXT NOT NULL, rating INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
        await pool.query(`CREATE TABLE IF NOT EXISTS wishlist (id SERIAL PRIMARY KEY, username VARCHAR(50) NOT NULL, game_id VARCHAR(50) NOT NULL, game_name VARCHAR(255), game_image TEXT, added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(username, game_id));`);
        await pool.query(`CREATE TABLE IF NOT EXISTS review_likes (id SERIAL PRIMARY KEY, review_id INT NOT NULL, username VARCHAR(50) NOT NULL, UNIQUE(review_id, username));`);
        res.send("✅ Tablas listas.");
    } catch (e) { res.status(500).send(e.message); }
});

// --- LIKES ---
app.post('/api/reviews/like', async (req, res) => {
    const { review_id, username } = req.body;
    try {
        const check = await pool.query('SELECT * FROM review_likes WHERE review_id = $1 AND username = $2', [review_id, username]);
        if (check.rows.length > 0) {
            await pool.query('DELETE FROM review_likes WHERE review_id = $1 AND username = $2', [review_id, username]);
            res.json({ action: 'removed' });
        } else {
            await pool.query('INSERT INTO review_likes (review_id, username) VALUES ($1, $2)', [review_id, username]);
            res.json({ action: 'added' });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/user-likes/:game_id/:username', async (req, res) => {
    try {
        const r = await pool.query(`SELECT rl.review_id FROM review_likes rl JOIN reviews r ON rl.review_id = r.id WHERE r.game_id = $1 AND rl.username = $2`, [req.params.game_id, req.params.username]);
        res.json(r.rows.map(row => row.review_id));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- REVIEWS ---
app.post('/api/reviews', async (req, res) => {
    const { game_id, username, comment, rating } = req.body;
    if (!game_id || !username) return res.status(400).json({ error: "Datos incompletos" });
    try {
        await pool.query('INSERT INTO reviews (game_id, username, comment, rating) VALUES ($1, $2, $3, $4)', [game_id, username, comment, rating]);
        res.json({ message: "Guardado" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/reviews/:game_id', async (req, res) => {
    try {
        const q = `SELECT r.*, (SELECT COUNT(*) FROM review_likes rl WHERE rl.review_id = r.id)::int as likes_count FROM reviews r WHERE r.game_id = $1 ORDER BY created_at DESC`;
        const r = await pool.query(q, [req.params.game_id]);
        res.json(r.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- WISHLIST ---
app.post('/api/wishlist/add', async (req, res) => {
    const { username, game_id, game_name, game_image } = req.body;
    try {
        await pool.query('INSERT INTO wishlist (username, game_id, game_name, game_image) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING', [username, game_id, game_name, game_image]);
        res.json({ message: "Añadido" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/wishlist/remove', async (req, res) => {
    try {
        await pool.query('DELETE FROM wishlist WHERE username = $1 AND game_id = $2', [req.body.username, String(req.body.game_id)]);
        res.json({ message: "Eliminado" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/wishlist/getall/:username', async (req, res) => {
    try {
        const r = await pool.query('SELECT * FROM wishlist WHERE username = $1 ORDER BY added_at DESC', [req.params.username]);
        res.json(r.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/wishlist/check/:username/:game_id', async (req, res) => {
    try {
        const r = await pool.query('SELECT * FROM wishlist WHERE username = $1 AND game_id = $2', [req.params.username, String(req.params.game_id)]);
        res.json({ is_in_wishlist: r.rows.length > 0 });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- ADMIN ---
app.delete('/api/admin/reviews/:id', adminAuth, async (req, res) => {
    try {
        await pool.query('DELETE FROM review_likes WHERE review_id = $1', [req.params.id]);
        await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
        res.json({ message: "Eliminado por admin" });
    } catch (e) { res.status(500).send(e.message); }
});

// --- STEAM ---
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
                    juegos.push({ appid: id, name: d[id].data.name, header_image: d[id].data.header_image, porcentaje_positivo: Math.round(score), genres: d[id].data.genres.map(g => g.description) });
                }
            } catch (e) { }
        }
        res.json(juegos.slice(0, 24));
    } catch (e) { res.json([]); }
});

// ==========================================
// INICIO
// ==========================================
app.listen(PORT, () => { console.log(`🚀 Servidor con Groq listo en ${PORT}`); });