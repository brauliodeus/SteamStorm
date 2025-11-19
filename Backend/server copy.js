// ====== CONFIGURACIÓN DEL SERVIDOR ======
const express = require("express");
const cors = require("cors");

// Si fetch no está disponible (en algunas versiones de Node), usa node-fetch dinámico
const fetch = global.fetch || ((...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)));

const app = express();
const PORT = 3000;

app.use(cors());

// ====== ENDPOINT PRINCIPAL ======
app.get("/api/game/:id", async (req, res) => {
    const { id } = req.params;

    try {
        console.log(`🟢 Solicitando datos de Steam para ID: ${id}`);

        // Llamadas a la API de Steam
        const infoRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=spanish`);
        const infoData = await infoRes.json();

        const reviewRes = await fetch(`https://store.steampowered.com/appreviews/${id}?json=1&language=spanish&filter=summary`);
        const reviewData = await reviewRes.json();

        // Validar respuestas
        if (!infoData[id]?.success || !infoData[id]?.data) {
            throw new Error("Datos no válidos desde Steam API (info)");
        }

        if (!reviewData?.query_summary) {
            throw new Error("Datos no válidos desde Steam API (reviews)");
        }

        // Crear objeto final con los datos relevantes
        const data = {
            name: infoData[id].data.name,
            header_image: infoData[id].data.header_image,
            short_description: infoData[id].data.short_description,
            valoracion: reviewData.query_summary.review_score_desc
        };

        console.log(`✅ Datos obtenidos para ${data.name}`);
        res.json(data);

    } catch (err) {
        console.error("❌ Error detallado:", err.message);
        res.status(500).json({ error: "Error al obtener datos" });
    }
});

// ====== INICIAR SERVIDOR ======
app.listen(PORT, () => {
    console.log(`🚀 Servidor SteamStorm corriendo en http://localhost:${PORT}`);
});
