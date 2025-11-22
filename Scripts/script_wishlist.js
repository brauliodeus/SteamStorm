// ====== CONFIGURACIÓN ======
const API_URL = "https://steamstorm.onrender.com"; 
const username = localStorage.getItem('username');

// ====== FUNCIÓN PRINCIPAL: CARGAR LISTA ======
async function cargarWishlist() {
    const contenedor = document.getElementById("wishlist-grid");
    
    // Validación de seguridad extra
    if (!username) {
        contenedor.innerHTML = "<p class='empty-message'>Error: No se pudo identificar al usuario.</p>";
        return;
    }

    try {
        // 1. Pedir la lista al servidor
        const res = await fetch(`${API_URL}/api/wishlist/getall/${username}`);
        
        if (!res.ok) throw new Error("Error al conectar con el servidor");
        
        const listaJuegos = await res.json();

        // 2. Limpiar contenedor
        contenedor.innerHTML = "";

        // 3. Verificar si está vacía
        if (listaJuegos.length === 0) {
            contenedor.innerHTML = `
                <div class="empty-message">
                    <i class="far fa-frown-open" style="font-size: 3rem; margin-bottom: 20px; display:block;"></i>
                    Tu lista de deseados está vacía.<br>
                    ¡Ve al inicio y agrega algunos juegos!
                </div>`;
            return;
        }

        // 4. Pintar los juegos (Crear tarjetas)
        listaJuegos.forEach(juego => {
            const card = document.createElement("div");
            card.classList.add("juego-card"); // Reusamos tu estilo de tarjeta
            
            // Usamos los datos guardados en la base de datos (nombre e imagen)
            card.innerHTML = `
                <img src="${juego.game_image}" alt="${juego.game_name}" class="juego-img">
                <h4>${juego.game_name}</h4>
                <p style="color:#ff4d4d; font-size:0.9rem; margin-bottom:15px;">
                    <i class="fas fa-heart"></i> Guardado
                </p>
            `;
            
            // Al hacer clic, vamos al detalle de ese juego
            card.style.cursor = "pointer";
            card.addEventListener("click", () => {
                window.location.href = `detalle.html?id=${juego.game_id}`;
            });

            contenedor.appendChild(card);
        });

    } catch (error) {
        console.error("Error cargando wishlist:", error);
        contenedor.innerHTML = `<p class='empty-message'>❌ Hubo un problema al cargar tu lista. Intenta recargar la página.</p>`;
    }
}

// ====== INICIAR AL CARGAR LA PÁGINA ======
document.addEventListener("DOMContentLoaded", cargarWishlist);