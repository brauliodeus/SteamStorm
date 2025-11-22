const API_URL = "https://steamstorm.onrender.com"; 

// Variables globales
const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");
const token = localStorage.getItem('token');
const username = localStorage.getItem('username') || "Anónimo";

// 1. CARGAR DETALLE DEL JUEGO
async function cargarDetalle() {
    const contenedor = document.getElementById("detalle-juego-content");
    
    if (!gameId) {
        contenedor.innerHTML = "<h2>❌ No se especificó un ID de juego.</h2>";
        return;
    }

    contenedor.innerHTML = "<h2>🔄 Cargando datos...</h2>";

    try {
        const res = await fetch(`${API_URL}/api/game/${gameId}`);
        if (!res.ok) throw new Error("Error del servidor");
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        contenedor.innerHTML = `
            <div style="display:flex; gap:20px; flex-wrap:wrap; justify-content:center; align-items:flex-start;">
                <div style="flex:1; min-width:300px;">
                    <img src="${data.header_image}" style="width:100%; border-radius:10px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                </div>
                <div style="flex:1; min-width:300px; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px;">
                    <h1 style="margin-top:0; color: #00c3ff;">${data.name}</h1>
                    <p style="font-size: 1.1em; line-height: 1.6;">${data.short_description}</p>
                    <hr style="border-color: #444; margin: 15px 0;">
                    <p><strong>🎭 Género:</strong> ${data.genres.join(", ")}</p>
                    <p><strong>⭐ Valoración:</strong> <span style="color:gold;">${data.valoracion}</span> (${data.porcentaje_positivo}% positivo)</p>
                </div>
            </div>
        `;
        cargarReseñas();
    } catch (error) {
        contenedor.innerHTML = `<h2 style="color: #ff6b6b;">⚠ No pudimos cargar el juego: ${error.message}</h2>`;
    }
}

// 2. CArgar Reseñas

async function cargarReseñas() {
    const lista = document.getElementById("lista-opiniones");
    try {
        const res = await fetch(`${API_URL}/api/reviews/${gameId}`);
        const reviews = await res.json();

        lista.innerHTML = "";
        if (reviews.length === 0) {
            lista.innerHTML = "<p style='text-align:center; color:#aaa;'>Aún no hay opiniones. ¡Sé el primero!</p>";
            return;
        }

        reviews.forEach(r => {
            // fecha y hora
            const fecha = new Date(r.created_at);
            const fechaLegible = fecha.toLocaleDateString() + " " + fecha.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            lista.innerHTML += `
                <div class="review-card" style="background: #1e1e2e; margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong style="color: #fff;">${r.username}</strong>
                        <span style="color:gold;">${r.rating}% ⭐</span>
                    </div>
                    <p style="margin-top:10px; color: #ddd;">${r.comment}</p>
                    
                    <small style="color:#888; display:block; margin-top:5px; text-align:right;">
                        📅 ${fechaLegible}
                    </small>
                </div>
            `;
        });
    } catch (error) { console.error("Error cargando reviews:", error); }
}

// 3. GESTIÓN DE PERMISOS (UI INTELIGENTE)
function configurarVistaUsuario() {
    const formulario = document.querySelector('.form-review');
    const menuCerrar = document.getElementById('cerrarsesion');
    
    // Si NO hay token (Usuario es Invitado)
    if (!token) {
        // A. Reemplazamos el formulario con un botón de Login
        formulario.innerHTML = `
            <div style="text-align:center; padding: 20px;">
                <h3 style="color:#ccc;">¿Quieres dejar tu opinión?</h3>
                <p>Necesitas una cuenta para valorar este juego.</p>
                <button onclick="window.location.href='../Guest/iniciosesion.html'" 
                    style="background:#e0a800; color:black; padding:10px 20px; border:none; border-radius:5px; cursor:pointer; font-weight:bold; margin-top:10px;">
                    <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
                </button>
            </div>
        `;

        // B. Ocultamos "Cerrar Sesión" del menú porque no tiene sentido
        if(menuCerrar) menuCerrar.parentElement.style.display = 'none';
    
    } else {
        // Si hay usuario, dejamos todo normal
        console.log("Usuario autenticado: Permitido comentar.");
    }
}

// 4. ENVIAR RESEÑA
async function enviarReseña() {
    const comment = document.getElementById("comment-input").value;
    const rating = document.getElementById("rating-input").value;

    if (!comment) return alert("Por favor escribe un comentario.");
    if(!token) return alert("Debes iniciar sesión.");

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

// INICIAR
document.addEventListener("DOMContentLoaded", () => {
    configurarVistaUsuario(); // <--- Primero configuramos qué se ve
    cargarDetalle();          // <--- Luego cargamos los datos
});