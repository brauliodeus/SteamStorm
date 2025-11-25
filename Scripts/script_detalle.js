const API_URL = "https://steamstorm.onrender.com"; 

// Variables Globales
const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");
const token = localStorage.getItem('token');
const username = localStorage.getItem('username') || "Anónimo";
const role = localStorage.getItem('role'); // <--- IMPORTANTE: Obtenemos el rol

let currentGameData = null;

// 1. CARGAR DETALLE (Igual que antes)
async function cargarDetalle() {
    const contenedor = document.getElementById("detalle-juego-content");
    if (!gameId) { contenedor.innerHTML = "<h2>❌ Sin ID.</h2>"; return; }

    // Buscamos en local primero
    let data = null;
    if (typeof buscarEnBackup === 'function') data = buscarEnBackup(gameId);

    if (data) {
        currentGameData = data;
        contenedor.innerHTML = `
            <div style="display:flex; gap:20px; flex-wrap:wrap; justify-content:center; align-items:flex-start;">
                <div style="flex:1; min-width:300px;">
                    <img src="${data.header_image}" style="width:100%; border-radius:10px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                </div>
                <div style="flex:1; min-width:300px; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px;">
                    <h1 style="margin-top:0; color: #00c3ff;">${data.name}</h1>
                    <p style="font-size: 1.1em;">${data.short_description}</p>
                    <p><strong>🎭 Género:</strong> ${data.genres ? data.genres.join(", ") : "Juego"}</p>
                    <p><strong>⭐ Valoración:</strong> <span style="color:gold;">${data.valoracion}</span> (${data.porcentaje_positivo}%)</p>
                    <button id="btn-wishlist" class="btn-wishlist" onclick="toggleWishlist()">
                        <i class="far fa-heart"></i> Añadir a Deseados
                    </button>
                </div>
            </div>
        `;
        checkWishlistStatus();
    } else {
        contenedor.innerHTML = "<h2>⚠ Info offline no disponible.</h2>";
    }
    // Siempre cargamos reseñas
    cargarReseñas();
}

// 2. CARGAR RESEÑAS (AQUÍ ESTÁ LA MAGIA DEL ADMIN) 👮‍♂️
async function cargarReseñas() {
    const lista = document.getElementById("lista-opiniones");
    
    try {
        const res = await fetch(`${API_URL}/api/reviews/${gameId}`);
        const reviews = await res.json();

        lista.innerHTML = "";
        if (reviews.length === 0) {
            lista.innerHTML = "<p style='text-align:center; color:#aaa;'>Sé el primero en opinar.</p>";
            return;
        }

        reviews.forEach(r => {
            const fecha = new Date(r.created_at).toLocaleString();
            
            // --- LÓGICA DE ADMIN ---
            // Si el rol es 'admin', creamos el botón. Si no, dejamos vacío.
            let deleteButton = "";
            if (role === 'admin') {
                deleteButton = `
                    <button onclick="eliminarComentarioAdmin(${r.id})" 
                        style="float:right; background: #3c1818; color: #ff4d4d; border: 1px solid #ff4d4d; 
                               cursor: pointer; padding: 2px 8px; border-radius: 4px; font-size: 11px;">
                        <i class="fas fa-trash"></i> Borrar
                    </button>
                `;
            }
            // -----------------------

            lista.innerHTML += `
                <div class="review-card" style="background: #1e1e2e; margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
                    <div style="margin-bottom: 10px;">
                        ${deleteButton} <strong style="color: #fff;">${r.username}</strong>
                        <span style="color:gold; margin-left:10px;">${r.rating}% ⭐</span>
                    </div>
                    <p style="margin-top:5px; color: #ddd;">${r.comment}</p>
                    <small style="color:#888; display:block; text-align:right;">📅 ${fecha}</small>
                </div>
            `;
        });
    } catch (error) { console.error("Error reviews", error); }
}

// 3. FUNCIÓN DE BORRADO (ADMIN) 🗑️
async function eliminarComentarioAdmin(reviewId) {
    if (!confirm("⚠️ ADMIN: ¿Estás seguro de eliminar este comentario permanentemente?")) return;

    try {
        const res = await fetch(`${API_URL}/api/admin/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': token // Enviamos la credencial de admin
            }
        });

        if (res.ok) {
            alert("Comentario eliminado correctamente.");
            cargarReseñas(); // Recargar lista para ver que desapareció
        } else {
            const data = await res.json();
            alert("Error: " + (data.msg || "No tienes permiso."));
        }
    } catch (error) {
        alert("Error de conexión.");
    }
}

// 4. ENVIAR RESEÑA (Usuario Normal)
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
        alert("Opinión publicada.");
        document.getElementById("comment-input").value = "";
        cargarReseñas();
    } catch (error) { alert("Error."); }
}

// 5. WISHLIST
async function checkWishlistStatus() {
    if (!token) return; 
    try {
        const res = await fetch(`${API_URL}/api/wishlist/check/${username}/${gameId}`);
        const data = await res.json();
        if (data.is_in_wishlist) updateWishlistButton(true);
    } catch (e) {}
}

async function toggleWishlist() {
    if (!token) return alert("Inicia sesión.");
    const btn = document.getElementById('btn-wishlist');
    const isActive = btn.classList.contains('active');
    try {
        let url = isActive ? `${API_URL}/api/wishlist/remove` : `${API_URL}/api/wishlist/add`;
        let method = isActive ? 'DELETE' : 'POST';
        const bodyData = { username, game_id: gameId };
        if (!isActive && currentGameData) {
            bodyData.game_name = currentGameData.name;
            bodyData.game_image = currentGameData.header_image;
        }
        const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(bodyData)});
        if (res.ok) updateWishlistButton(!isActive);
    } catch (e) {}
}

function updateWishlistButton(active) {
    const btn = document.getElementById('btn-wishlist');
    if(!btn) return;
    if (active) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-heart"></i> En tu Lista';
        btn.style.background = "#ff4d4d"; btn.style.color = "white";
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="far fa-heart"></i> Añadir a Deseados';
        btn.style.background = "transparent"; btn.style.color = "#ff4d4d";
    }
}

// 6. VISTA
function configurarVista() {
    if (!token) {
        const form = document.querySelector('.form-review');
        if(form) form.innerHTML = `<div style='text-align:center; padding:20px;'><p>Inicia sesión para opinar.</p><button onclick="window.location.href='../Guest/iniciosesion.html'" style="padding:10px;">Ir al Login</button></div>`;
        const btnCerrar = document.getElementById('cerrarsesion');
        if(btnCerrar) btnCerrar.parentElement.style.display = 'none';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    configurarVista();
    cargarDetalle();
});