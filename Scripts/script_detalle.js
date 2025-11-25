const API_URL = "https://steamstorm.onrender.com"; 
const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");
const token = localStorage.getItem('token');
const username = localStorage.getItem('username') || "Anónimo";
const role = localStorage.getItem('role');

let currentGameData = null;

// 1. CARGAR DETALLE
async function cargarDetalle() {
    const contenedor = document.getElementById("detalle-juego-content");
    if (!gameId) { contenedor.innerHTML = "<h2>❌ Sin ID.</h2>"; return; }

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
                    <p>${data.short_description}</p>
                    <p><strong>Género:</strong> ${data.genres ? data.genres.join(", ") : "Juego"}</p>
                    <p><strong>Valoración:</strong> <span style="color:gold;">${data.valoracion}</span> (${data.porcentaje_positivo}%)</p>
                    <button id="btn-wishlist" class="btn-wishlist" onclick="toggleWishlist()"><i class="far fa-heart"></i> Añadir a Deseados</button>
                </div>
            </div>
        `;
        checkWishlistStatus();
    } else { contenedor.innerHTML = "<h2>⚠ Info offline no disponible.</h2>"; }
    cargarReseñas();
}

// 2. CARGAR RESEÑAS Y LIKES
async function cargarReseñas() {
    const lista = document.getElementById("lista-opiniones");
    
    try {
        // A. Obtener reseñas con contadores
        const resReviews = await fetch(`${API_URL}/api/reviews/${gameId}`);
        const reviews = await resReviews.json();

        // B. Si hay usuario, ver cuáles ha likeado
        let misLikes = [];
        if (token) {
            const resLikes = await fetch(`${API_URL}/api/user-likes/${gameId}/${username}`);
            if (resLikes.ok) misLikes = await resLikes.json();
        }

        lista.innerHTML = "";
        if (reviews.length === 0) {
            lista.innerHTML = "<p style='text-align:center; color:#aaa;'>Sé el primero en opinar.</p>";
            return;
        }

        reviews.forEach(r => {
            const fecha = new Date(r.created_at).toLocaleString();
            
            // Verificar si el usuario actual dio like
            const yaDioLike = misLikes.includes(r.id);
            const colorLike = yaDioLike ? "#66c0f4" : "#888"; // Azul si like, gris si no
            const claseIcono = yaDioLike ? "fas" : "far";

            // Botón Admin
            let deleteButton = "";
            if (role === 'admin') {
                deleteButton = `<button onclick="eliminarComentarioAdmin(${r.id})" style="float:right; background:#3c1818; color:#f44; border:1px solid #f44; cursor:pointer; font-size:10px; padding:2px 5px;">BORRAR</button>`;
            }

            lista.innerHTML += `
                <div class="review-card" style="background: #1e1e2e; margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
                    <div style="margin-bottom: 10px; display:flex; justify-content:space-between;">
                        <div>
                            <strong style="color: #fff;">${r.username}</strong>
                            <span style="color:gold; margin-left:10px;">${r.rating}% ⭐</span>
                        </div>
                        ${deleteButton}
                    </div>
                    <p style="margin-top:5px; color: #ddd;">${r.comment}</p>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px;">
                        <button onclick="darLike(${r.id})" style="background:none; border:none; color:${colorLike}; cursor:pointer; font-size:1.1rem;">
                            <i class="${claseIcono} fa-thumbs-up"></i> <span id="count-${r.id}">${r.likes_count || 0}</span>
                        </button>
                        <small style="color:#555;">${fecha}</small>
                    </div>
                </div>
            `;
        });
    } catch (error) { console.error("Error reviews", error); }
}

// 3. FUNCIÓN DAR LIKE
async function darLike(reviewId) {
    if (!token) return alert("Inicia sesión para dar Like.");

    try {
        const res = await fetch(`${API_URL}/api/reviews/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ review_id: reviewId, username: username })
        });

        if (res.ok) {
            // Recargamos las reseñas para ver el cambio de color y número
            cargarReseñas();
        }
    } catch (e) { console.error(e); }
}

// ... (El resto de funciones: enviarReseña, toggleWishlist, etc. las mantienes igual) ...
async function eliminarComentarioAdmin(id) { /* ... tu código anterior ... */ 
    if (!confirm("¿Borrar?")) return;
    await fetch(`${API_URL}/api/admin/reviews/${id}`, { method: 'DELETE', headers: { 'x-auth-token': token } });
    cargarReseñas();
}
async function enviarReseña() { /* ... tu código anterior ... */ 
    if (!token) return alert("Debes iniciar sesión.");
    const comment = document.getElementById("comment-input").value;
    const rating = document.getElementById("rating-input").value;
    if (!comment) return alert("Escribe algo.");
    await fetch(`${API_URL}/api/reviews`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ game_id: gameId, username, comment, rating }) });
    document.getElementById("comment-input").value = "";
    cargarReseñas();
}
async function checkWishlistStatus() { /* ... */ try{ const res = await fetch(`${API_URL}/api/wishlist/check/${username}/${gameId}`); const d=await res.json(); if(d.is_in_wishlist) updateWishlistButton(true); }catch(e){} }
async function toggleWishlist() { /* ... */ if(!token)return; const b=document.getElementById('btn-wishlist'); const a=b.classList.contains('active'); const url=a?`${API_URL}/api/wishlist/remove`:`${API_URL}/api/wishlist/add`; await fetch(url, {method:a?'DELETE':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,game_id:gameId,game_name:currentGameData.name,game_image:currentGameData.header_image})}); updateWishlistButton(!a); }
function updateWishlistButton(a) { const b=document.getElementById('btn-wishlist'); if(a){b.classList.add('active');b.innerHTML='<i class="fas fa-heart"></i> En tu Lista';b.style.background="#f44";b.style.color="white";}else{b.classList.remove('active');b.innerHTML='<i class="far fa-heart"></i> Deseados';b.style.background="transparent";b.style.color="#f44";} }
function configurarVista() { if(!token) { const f=document.querySelector('.form-review'); if(f)f.innerHTML="<p style='text-align:center'>Inicia sesión para opinar.</p>"; } }

document.addEventListener("DOMContentLoaded", () => { configurarVista(); cargarDetalle(); });