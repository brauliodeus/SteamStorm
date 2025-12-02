const API_URL = "https://steamstorm.onrender.com"; 
const username = localStorage.getItem('username');

// Variables globales para manejar el filtrado instantáneo
let allMyGames = []; 

if(username) document.getElementById('user-title').innerText = `LISTA DE DESEADOS DE ${username.toUpperCase()}`;

// ====== 1. CARGA INICIAL ======
async function cargarWishlist() {
    const contenedor = document.getElementById("wishlist-grid");
    if (!username) return contenedor.innerHTML = "<p style='color:white; text-align:center;'>Inicia sesión para ver tu lista.</p>";

    try {
        // Pide la lista básica (algo rápido) de juegos en la wishlist
        const res = await fetch(`${API_URL}/api/wishlist/getall/${username}`);
        const listaBasica = await res.json();

        if (listaBasica.length === 0) {
            contenedor.innerHTML = "<p style='color:#888; text-align:center; padding:40px;'>Tu lista está vacía. ¡Agrega juegos desde la tienda!</p>";
            return;
        }

        // Preparamos la lista completa mostrando los datos
        allMyGames = []; // Limpiamos

        // Iteramos para obtener detalles frescos (etiquetas, puntuacion) de cada juego
        for (const item of listaBasica) {
            let detalles = { 
                name: item.game_name, 
                header_image: item.game_image,
                valoracion: "Sin información",
                porcentaje: 0, // Necesario para ordenar
                genres: ["Juego"]
            };

            try {
                const gameRes = await fetch(`${API_URL}/api/game/${item.game_id}`);
                if(gameRes.ok) {
                    const data = await gameRes.json();
                    detalles = {
                        name: data.name,
                        header_image: data.header_image,
                        valoracion: data.valoracion,
                        porcentaje: data.porcentaje_positivo,
                        genres: data.genres || []
                    };
                }
            } catch (e) { console.log("Usando datos cacheados"); }

            // Guarda el objeto completo en memoria
            allMyGames.push({
                ...item, // id, added_at
                details: detalles // info fresca
            });
        }

        renderGames(allMyGames);

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = "<p style='color:red; text-align:center;'>Error cargando lista.</p>";
    }
}

// ====== 2. FUNCIÓN DE DIBUJADO (RENDER) ======
function renderGames(listaJuegos) {
    const contenedor = document.getElementById("wishlist-grid");
    contenedor.innerHTML = ""; // Limpiar contenedor

    if (listaJuegos.length === 0) {
        contenedor.innerHTML = "<p style='text-align:center; color:#888; margin-top:20px;'>No se encontraron juegos.</p>";
        return;
    }

    listaJuegos.forEach(item => {
        const fechaAgregado = new Date(item.added_at).toLocaleDateString();
        
        const row = document.createElement("div");
        row.classList.add("wishlist-row");
        
        row.innerHTML = `
            <img src="${item.details.header_image}" onclick="irDetalle('${item.game_id}')">
            
            <div class="wishlist-info">
                <h3 class="game-title" onclick="irDetalle('${item.game_id}')">${item.details.name}</h3>
                
                <div class="game-stats">
                    <div style="margin-bottom:5px;">
                        RESEÑAS GENERALES: <span class="review-tag">${item.details.valoracion}</span>
                    </div>
                    <div style="margin-bottom:5px;">
                        FECHA LANZAMIENTO: <span style="color:#b0aeac;">Desconocida</span>
                    </div>
                    <div class="platform-icons">
                        <i class="fab fa-windows"></i> <i class="fab fa-steam"></i>
                    </div>
                    <div style="margin-top:10px; color: #56707f;">
                        Etiquetas: ${item.details.genres.slice(0,3).join(", ")}
                    </div>
                </div>
            </div>

            <div class="wishlist-action">
                <div style="color:white; font-size:13px;">Disponible</div> 
                
                <div style="margin-top:15px; text-align:right;">
                    <div class="date-added">Añadido el ${fechaAgregado}</div>
                    <div class="remove-link" onclick="eliminarJuego('${item.game_id}')">Eliminar</div>
                </div>
            </div>
        `;
        contenedor.appendChild(row);
    });
}

// ====== 3. LÓGICA DE FILTRADO Y ORDEN ======
function filtrarYOrdenar() {
    const textoBusqueda = document.getElementById('search-input').value.toLowerCase();
    const criterioOrden = document.getElementById('sort-select').value;

    // 1. Filtrar
    let resultados = allMyGames.filter(item => {
        const nombre = item.details.name.toLowerCase();
        const etiquetas = item.details.genres.join(" ").toLowerCase();
        return nombre.includes(textoBusqueda) || etiquetas.includes(textoBusqueda);
    });

    // 2. Ordenar
    resultados.sort((a, b) => {
        if (criterioOrden === 'name') {
            return a.details.name.localeCompare(b.details.name);
        } else if (criterioOrden === 'date-new') {
            return new Date(b.added_at) - new Date(a.added_at);
        } else if (criterioOrden === 'date-old') {
            return new Date(a.added_at) - new Date(b.added_at);
        } else if (criterioOrden === 'review') {
            return b.details.porcentaje - a.details.porcentaje;
        }
    });


    renderGames(resultados);
}

// ====== 4. LISTENERS DE EVENTOS ======
document.getElementById('search-input').addEventListener('input', filtrarYOrdenar);
document.getElementById('sort-select').addEventListener('change', filtrarYOrdenar);

// Funciones auxiliares
function irDetalle(id) { window.location.href = `detalle.html?id=${id}`; }

async function eliminarJuego(id) {
    if(!confirm("¿Eliminar de la lista?")) return;
    try {
        await fetch(`${API_URL}/api/wishlist/remove`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, game_id: id })
        });
        // Se recarga todo para refrescar la lista global
        cargarWishlist();
    } catch (e) { alert("Error al eliminar"); }
}

// Iniciar
document.addEventListener("DOMContentLoaded", cargarWishlist);