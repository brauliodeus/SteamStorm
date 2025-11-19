// ====== CONFIGURACIÓN DEL SERVIDOR ======
const express = require("express");
const cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ====== ENDPOINT: Datos de un juego individual ======
app.get("/api/game/:id", async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`🟢 Solicitando datos de Steam para ID: ${id}`);

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
      // 👇 Agregamos el género
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

// ====== ENDPOINT: Juegos mejor valorados ======
app.get("/api/top-games", async (req, res) => {
  try {
    console.log("🟢 Obteniendo juegos más valorados desde Steam...");

    const appIDs = [
      1091500, // Cyberpunk 2077
      1174180, // RDR2
      1086940, // Baldur’s Gate 3
      1144200, // Ready or Not
      220, // Half-Life 2
      292030, // Witcher 3
      1245620, // Elden Ring
      1623730, // Lethal Company
      381210, // Dead by Daylight
      550, // Left 4 Dead 2
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

app.listen(PORT, () => {
  console.log(`🚀 Servidor SteamStorm corriendo en http://localhost:${PORT}`);
});
