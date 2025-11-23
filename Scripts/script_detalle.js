const API_URL = "https://steamstorm.onrender.com"; 

// 1. OBTENER PARÁMETROS
const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");
const token = localStorage.getItem('token');
const username = localStorage.getItem('username') || "Anónimo";

// 2. VARIABLE GLOBAL IMPORTANTE
let currentGameData = null;

// 3. FUNCIÓN PRINCIPAL: CARGAR DETALLE
async function cargarDetalle() {
    const contenedor = document.getElementById("detalle-juego-content");
    
    if (!gameId) {
        contenedor.innerHTML = "<h2>❌ Error: No se especificó un juego.</h2>";
        return;
    }

    // A. Intentamos buscar en el archivo de respaldo local (Instantáneo)
    let data = null;
    
    // Se verifica si el archivo de respaldo se cargó correctamente
    if (typeof buscarEnBackup === 'function') {
        data = buscarEnBackup(gameId);
    } else {
        console.error("Falta cargar datos_backup.js en el HTML");
    }

    if (data) {
        // Juego encontrado en local
        currentGameData = data; 

        contenedor.innerHTML = `
            <div style="display:flex; gap:20px; flex-wrap:wrap; justify-content:center; align-items:flex-start;">
                <div style="flex:1; min-width:300px;">
                    <img src="${data.header_image}" style="width:100%; border-radius:10px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                </div>
                <div style="flex:1; min-width:300px; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px;">
                    <h1 style="margin-top:0; color: #00c3ff;">${data.name}</h1>
                    <p style="font-size: 1.1em; line-height: 1.6;">${data.short_description}</p>
                    <hr style="border-color: #444; margin: 15px 0;">
                    <p><strong>🎭 Género:</strong> ${data.genres ? data.genres.join(", ") : "Juego"}</p>
                    <p><strong>⭐ Valoración:</strong> <span style="color:gold;">${data.valoracion}</span> (${data.porcentaje_positivo}% positivo)</p>
                    
                    <button id="btn-wishlist" class="btn-wishlist" onclick="toggleWishlist()">
                        <i class="far fa-heart"></i> Añadir a Deseados
                    </button>
                </div>
            </div>
        `;
        
        // Verificar si ya está en favoritos
        checkWishlistStatus();

    } else {
        // Si no está en el respaldo
        contenedor.innerHTML = "<h2>⚠ Información del juego no disponible.</h2>";
    }

    // B. Cargamos las reseñas (estén o no los datos del juego)
    cargarReseñas();
}

// 4. CARGAR RESEÑAS (Desde la base de datos)
async function cargarReseñas() {
    const lista = document.getElementById("lista-opiniones");
    // Mensaje de carga temporal
    lista.innerHTML = "<p style='color:#888;'>Cargando opiniones...</p>";

    try {
        const res = await fetch(`${API_URL}/api/reviews/${gameId}`);
        
        if (!res.ok) throw new Error("Error de conexión con reseñas");
        
        const reviews = await res.json();

        lista.innerHTML = ""; // Limpiar mensaje de carga

        if (reviews.length === 0) {
            lista.innerHTML = "<p style='text-align:center; color:#aaa;'>Aún no hay opiniones. ¡Sé el primero!</p>";
            return;
        }

        reviews.forEach(r => {
            // Formatear fecha
            const fecha = new Date(r.created_at).toLocaleString();
            
            lista.innerHTML += `
                <div class="review-card" style="background: #1e1e2e; margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong style="color: #fff;">${r.username}</strong>
                        <span style="color:gold;">${r.rating}% ⭐</span>
                    </div>
                    <p style="margin-top:10px; color: #ddd;">${r.comment}</p>
                    <small style="color:#888; display:block; text-align:right;">📅 ${fecha}</small>
                </div>
            `;
        });
    } catch (error) { 
        console.error(error);
        lista.innerHTML = "<p style='color:red;'>No se pudieron cargar los comentarios (Error del servidor).</p>";
    }
}

// 5. GESTIÓN DE WISHLIST (Favoritos)
async function checkWishlistStatus() {
    if (!token) return; 
    try {
        const res = await fetch(`${API_URL}/api/wishlist/check/${username}/${gameId}`);
        const data = await res.json();
        if (data.is_in_wishlist) updateWishlistButton(true);
    } catch (error) { console.error("Error checking wishlist"); }
}

async function toggleWishlist() {
    if (!token) return alert("Inicia sesión para guardar favoritos.");
    const btn = document.getElementById('btn-wishlist');
    const isActive = btn.classList.contains('active');

    try {
        let url = isActive ? `${API_URL}/api/wishlist/remove` : `${API_URL}/api/wishlist/add`;
        let method = isActive ? 'DELETE' : 'POST';
        
        // Usamos los datos guardados en la variable global
        const bodyData = { username, game_id: gameId };
        if (!isActive && currentGameData) {
            bodyData.game_name = currentGameData.name;
            bodyData.game_image = currentGameData.header_image;
        }

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });

        if (res.ok) updateWishlistButton(!isActive);
        else alert("Error al actualizar lista.");
    } catch (error) { alert("Error de conexión."); }
}

function updateWishlistButton(active) {
    const btn = document.getElementById('btn-wishlist');
    if(!btn) return;
    if (active) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-heart"></i> En tu Lista';
        btn.style.background = "#ff4d4d";
        btn.style.color = "white";
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="far fa-heart"></i> Añadir a Deseados';
        btn.style.background = "transparent";
        btn.style.color = "#ff4d4d";
    }
}

// 6. ENVIAR RESEÑA
async function enviarReseña() {
    if (!token) return alert("Debes iniciar sesión.");
    const comment = document.getElementById("comment-input").value;
    const rating = document.getElementById("rating-input").value;

    if (!comment) return alert("Escribe algo.");

    try {
        const res = await fetch(`${API_URL}/api/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game_id: gameId, username, comment, rating })
        });

        if (res.ok) {
            alert("¡Opinión publicada!");
            document.getElementById("comment-input").value = "";
            cargarReseñas();
        } else {
            alert("Error al guardar reseña.");
        }
    } catch (error) { alert("Error de conexión."); }
}

// 7. CONFIGURACIÓN DE VISTA (Invitado vs Usuario)
function configurarVista() {
    if (!token) {
        const form = document.querySelector('.form-review');
        if(form) {
            form.innerHTML = `
                <div style="text-align:center; padding:20px; background:rgba(0,0,0,0.2); border-radius:10px;">
                    <p>Inicia sesión para opinar.</p>
                    <button onclick="window.location.href='../Guest/iniciosesion.html'" 
                    style="background:#e0a800; padding:10px 20px; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">Iniciar Sesión</button>
                </div>`;
        }
        const btnCerrar = document.getElementById('cerrarsesion');
        if(btnCerrar) btnCerrar.parentElement.style.display = 'none';
    }
}

// INICIO
document.addEventListener("DOMContentLoaded", () => {
    configurarVista();
    cargarDetalle();
});