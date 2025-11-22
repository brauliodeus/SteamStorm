const API_URL = "https://steamstorm.onrender.com"; 
const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");
const token = localStorage.getItem('token');
const username = localStorage.getItem('username') || "Anónimo";

// Variables para guardar info del juego actual
let currentGameData = null;

// 1. CARGAR DETALLE
async function cargarDetalle() {
    const contenedor = document.getElementById("detalle-juego-content");
    if (!gameId) return contenedor.innerHTML = "<h2>❌ ID no encontrado.</h2>";

    contenedor.innerHTML = "<h2>🔄 Cargando...</h2>";

    try {
        const res = await fetch(`${API_URL}/api/game/${gameId}`);
        if (!res.ok) throw new Error("Error servidor");
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentGameData = data; // Guardamos datos para usarlos en wishlist

        contenedor.innerHTML = `
            <div style="display:flex; gap:20px; flex-wrap:wrap; justify-content:center; align-items:flex-start;">
                <div style="flex:1; min-width:300px;">
                    <img src="${data.header_image}" style="width:100%; border-radius:10px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                </div>
                <div style="flex:1; min-width:300px; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px;">
                    <h1 style="margin-top:0; color: #00c3ff;">${data.name}</h1>
                    <p style="font-size: 1.1em;">${data.short_description}</p>
                    <p><strong>🎭 Género:</strong> ${data.genres.join(", ")}</p>
                    <p><strong>⭐ Valoración:</strong> <span style="color:gold;">${data.valoracion}</span> (${data.porcentaje_positivo}%)</p>
                    
                    <button id="btn-wishlist" class="btn-wishlist" onclick="toggleWishlist()">
                        <i class="far fa-heart"></i> Añadir a Deseados
                    </button>
                </div>
            </div>
        `;
        
        cargarReseñas();
        checkWishlistStatus(); // Verificar si ya es favorito

    } catch (error) {
        contenedor.innerHTML = `<h2>⚠ Error: ${error.message}</h2>`;
    }
}

// 2. VERIFICAR SI ES FAVORITO
async function checkWishlistStatus() {
    if (!token) return; // Si es invitado, no revisamos
    try {
        const res = await fetch(`${API_URL}/api/wishlist/check/${username}/${gameId}`);
        const data = await res.json();
        if (data.is_in_wishlist) {
            updateWishlistButton(true);
        }
    } catch (error) { console.error("Error checking wishlist"); }
}

// 3. AGREGAR/ELIMINAR DE FAVORITOS
async function toggleWishlist() {
    if (!token) return alert("Inicia sesión para guardar favoritos.");
    
    const btn = document.getElementById('btn-wishlist');
    const isActive = btn.classList.contains('active');

    try {
        let url = isActive ? `${API_URL}/api/wishlist/remove` : `${API_URL}/api/wishlist/add`;
        let method = isActive ? 'DELETE' : 'POST';
        
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                game_id: gameId,
                game_name: currentGameData.name,
                game_image: currentGameData.header_image
            })
        });

        if (res.ok) {
            updateWishlistButton(!isActive);
        } else {
            alert("Error al actualizar lista.");
        }
    } catch (error) { alert("Error de conexión."); }
}

function updateWishlistButton(active) {
    const btn = document.getElementById('btn-wishlist');
    if (active) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-heart"></i> En tu Lista';
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="far fa-heart"></i> Añadir a Deseados';
    }
}

// 4. RESEÑAS
async function cargarReseñas() {
    const lista = document.getElementById("lista-opiniones");
    try {
        const res = await fetch(`${API_URL}/api/reviews/${gameId}`);
        const reviews = await res.json();
        lista.innerHTML = reviews.length ? "" : "<p style='text-align:center; color:#aaa;'>¡Sé el primero en opinar!</p>";
        reviews.forEach(r => {
            const fecha = new Date(r.created_at).toLocaleString();
            lista.innerHTML += `
                <div style="background: #1e1e2e; margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong style="color: #fff;">${r.username}</strong>
                        <span style="color:gold;">${r.rating}% ⭐</span>
                    </div>
                    <p style="margin-top:10px; color: #ddd;">${r.comment}</p>
                    <small style="color:#888; display:block; text-align:right;">📅 ${fecha}</small>
                </div>`;
        });
    } catch (error) { console.error(error); }
}

function configurarVistaUsuario() {
    if (!token) {
        document.querySelector('.form-review').innerHTML = `
            <div style="text-align:center;">
                <p>Inicia sesión para opinar o guardar en favoritos.</p>
                <button onclick="window.location.href='../Guest/iniciosesion.html'" style="background:#e0a800; padding:10px; border-radius:5px; cursor:pointer;">Iniciar Sesión</button>
            </div>`;
        const btnCerrar = document.getElementById('cerrarsesion');
        if(btnCerrar) btnCerrar.parentElement.style.display = 'none';
    }
}

async function enviarReseña() {
    if (!token) return alert("Debes iniciar sesión.");
    const comment = document.getElementById("comment-input").value;
    const rating = document.getElementById("rating-input").value;
    if (!comment) return alert("Escribe algo.");

    try {
        await fetch(`${API_URL}/api/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game_id: gameId, username, comment, rating })
        });
        alert("¡Opinión publicada!");
        document.getElementById("comment-input").value = "";
        cargarReseñas();
    } catch (error) { alert("Error."); }
}

document.addEventListener("DOMContentLoaded", () => {
    configurarVistaUsuario();
    cargarDetalle();
});