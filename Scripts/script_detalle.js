const API_URL = "https://steamstorm.onrender.com"; 

// Obtener ID de la URL (ej: detalle.html?id=123)
const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");
const username = localStorage.getItem('username') || "Usuario";

async function cargarDetalle() {
    if (!gameId) return;
    const contenedor = document.getElementById("detalle-juego-content");

    try {
        const res = await fetch(`${API_URL}/api/game/${gameId}`);
        const data = await res.json();

        contenedor.innerHTML = `
            <div style="display:flex; gap:20px; flex-wrap:wrap; justify-content:center;">
                <img src="${data.header_image}" style="border-radius:10px; max-width:100%;">
                <div style="max-width:500px;">
                    <h1>${data.name}</h1>
                    <p>${data.short_description}</p>
                    <p><strong>Género:</strong> ${data.genres.join(", ")}</p>
                    <h3 style="color:gold;">Valoración Steam: ${data.porcentaje_positivo}%</h3>
                </div>
            </div>
        `;
    } catch (error) {
        contenedor.innerHTML = "<h2>Error al cargar el juego.</h2>";
    }
}

async function cargarReseñas() {
    const lista = document.getElementById("lista-opiniones");
    try {
        const res = await fetch(`${API_URL}/api/reviews/${gameId}`);
        const reviews = await res.json();

        lista.innerHTML = "";
        if (reviews.length === 0) {
            lista.innerHTML = "<p>No hay opiniones aún. ¡Sé el primero!</p>";
            return;
        }

        reviews.forEach(r => {
            lista.innerHTML += `
                <div class="review-card">
                    <div style="display:flex; justify-content:space-between;">
                        <strong>${r.username}</strong>
                        <span style="color:gold;">Puntuación: ${r.rating}</span>
                    </div>
                    <p style="margin-top:10px;">${r.comment}</p>
                    <small style="color:#888;">${new Date(r.created_at).toLocaleDateString()}</small>
                </div>
            `;
        });
    } catch (error) { console.error(error); }
}

async function enviarReseña() {
    const comment = document.getElementById("comment-input").value;
    const rating = document.getElementById("rating-input").value;

    if (!comment) return alert("Por favor escribe un comentario.");

    try {
        const res = await fetch(`${API_URL}/api/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game_id: gameId, username, comment, rating })
        });

        if (res.ok) {
            alert("¡Opinión publicada!");
            document.getElementById("comment-input").value = "";
            cargarReseñas(); // Recargar lista
        } else {
            alert("Error al guardar reseña.");
        }
    } catch (error) { alert("Error de conexión."); }
}

// Iniciar
if(gameId) {
    cargarDetalle();
    cargarReseñas();
} else {
    document.getElementById("detalle-juego-content").innerHTML = "<h1>Juego no seleccionado</h1>";
}