// ====== CONFIGURACIÓN ======
const API_URL = "https://steamstorm.onrender.com"; 

const semanales = [292030, 1174180, 945360]; 

// ====== FUNCIONES DE PETICIÓN (FETCH) ======
async function obtenerJuego(appid) {
    const res = await fetch(`${API_URL}/api/game/${appid}`);
    return await res.json();
}

async function obtenerJuegosTop() {
    const res = await fetch(`${API_URL}/api/top-games`);
    return await res.json();
}

// Función de estrellas
function generarEstrellas(valoracion) {
    const mapping = {
        "Overwhelmingly Positive": 100, "Very Positive": 90, "Positive": 80,
        "Mostly Positive": 70, "Mixed": 50, "Mostly Negative": 30,
        "Negative": 20, "Very Negative": 10, "Overwhelmingly Negative": 0
    };
    const porcentaje = typeof valoracion === "string" ? (mapping[valoracion] || 50) : valoracion;
    const estrellasLlenas = Math.round(porcentaje / 20);
    let estrellasHTML = "";
    for (let i = 1; i <= 5; i++) {
        estrellasHTML += `<i class="fa${i <= estrellasLlenas ? "s" : "r"} fa-star" style="color: gold;"></i>`;
    }
    return `${estrellasHTML} <span style="color:#D9D9D9;">(${porcentaje}%)</span>`;
}

// Crear Tarjetas
function crearCardJuego(info) {
    const div = document.createElement("div");
    div.classList.add("juego-card");
    div.innerHTML = `
        <img src="${info.header_image}" alt="${info.name}" class="juego-img">
        <h4>${info.name}</h4>
        <p><strong>Género:</strong> ${info.genres ? info.genres.join(", ") : "Varios"}</p>
        <p><strong>Valoración:</strong> ${generarEstrellas(info.porcentaje_positivo)}</p>
    `;
    div.addEventListener("click", () => {
        window.location.href = `detalle.html?id=${info.appid}`;
    });
    return div;
}

function crearCardDestacado(info) {
    const div = document.createElement("div");
    div.classList.add("destacado-card");
    div.innerHTML = `
        <img src="${info.header_image}" alt="${info.name}">
        <div class="info">
            <h3>${info.name}</h3>
            <p>${info.short_description}</p>
            <p><strong>Valoración:</strong> ${generarEstrellas(info.porcentaje_positivo)}</p>
        </div>
    `;
    return div;
}

// Cargar Secciones
async function cargarDestacados() {
    const contenedor = document.querySelector(".juegos_destacados");
    if(!contenedor) return;
    contenedor.innerHTML = "<p style='text-align:center'>Cargando servidor...</p>";
    
    try {
        const juegosTop = await obtenerJuegosTop();
        const top3 = juegosTop.slice(0, 3);
        contenedor.innerHTML = "";
        const juegos = [];

        for (const juego of top3) {
            const card = crearCardDestacado(juego);
            contenedor.appendChild(card);
            juegos.push(card);
        }

        if (juegos.length > 0) {
            let index = 0;
            juegos[index].classList.add("activo");
            setInterval(() => {
                juegos[index].classList.remove("activo");
                index = (index + 1) % juegos.length;
                juegos[index].classList.add("activo");
            }, 5000);
        }
    } catch (err) {
        contenedor.innerHTML = "<p style='color:red; text-align:center'>Error cargando juegos.</p>";
    }
}

async function cargarTopJuegos() {
    const contenedor = document.querySelector(".juegos_top");
    if(!contenedor) return;
    try {
        const juegosTop = await obtenerJuegosTop();
        contenedor.innerHTML = "";
        for (const juego of juegosTop) {
            contenedor.appendChild(crearCardJuego(juego));
        }
    } catch (err) {
        console.error(err);
    }
}

async function cargarSeccion(ids, selector) {
    const contenedor = document.querySelector(selector);
    if(!contenedor) return;
    for (let id of ids) {
        try {
            const info = await obtenerJuego(id);
            contenedor.appendChild(crearCardJuego(info));
        } catch (error) { console.error(error); }
    }
}

// Iniciar
document.addEventListener("DOMContentLoaded", () => {
    cargarDestacados();
    cargarTopJuegos();
    cargarSeccion(semanales, ".juegos_semanales");
});