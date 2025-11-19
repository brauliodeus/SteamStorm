// ====== IDS DE JUEGOS ======
const destacados = [730, 570, 440]; // CS2, Dota 2, TF2
const topJuegos = [1091500, 271590, 381210, 292030, 1174180, 440]; // Cyberpunk, GTA V, Dead by Daylight
const semanales = [292030, 1174180, 945360]; // Witcher 3, RDR2, Among Us

// ====== FUNCIONES ======

// Obtiene datos desde tu backend Node
async function obtenerJuego(appid) {
    const res = await fetch(`http://localhost:3000/api/game/${appid}`);
    const data = await res.json();
    return data;
}

// Convierte porcentaje o tipo textual a estrellas
function generarEstrellas(valoracion) {
    let porcentaje;

    // Si viene en texto tipo "Very Positive"
    if (typeof valoracion === "string") {
        const mapping = {
            "Overwhelmingly Positive": 100,
            "Very Positive": 90,
            "Positive": 80,
            "Mostly Positive": 70,
            "Mixed": 50,
            "Mostly Negative": 30,
            "Negative": 20,
            "Very Negative": 10,
            "Overwhelmingly Negative": 0
        };
        porcentaje = mapping[valoracion] || 50;
    } else {
        // Si viene como número (porcentaje)
        porcentaje = valoracion;
    }

    const estrellasLlenas = Math.round(porcentaje / 20); // de 0 a 5 estrellas
    let estrellasHTML = "";

    for (let i = 1; i <= 5; i++) {
        estrellasHTML += `<i class="fa${i <= estrellasLlenas ? "s" : "r"} fa-star" style="color: gold;"></i>`;
    }

    return `${estrellasHTML} <span style="color:#D9D9D9;">(${porcentaje}%)</span>`;
}

// Crea una card para los destacados
function crearCardDestacado(info) {
    const div = document.createElement("div");
    div.classList.add("destacado-card");
    div.innerHTML = `
        <img src="${info.header_image}" alt="${info.name}">
        <div class="info">
            <h3>${info.name}</h3>
            <p>${info.short_description}</p>
           <p><strong>Valoración:</strong> ${generarEstrellas(info.valoracion)}</p>
        </div>
    `;
    return div;
}

// Carga los destacados con efecto rotatorio
async function cargarDestacados() {
    const contenedor = document.querySelector(".juegos_destacados");
    const juegos = [];

    for (let id of destacados) {
        const info = await obtenerJuego(id);
        const card = document.createElement("div");
        card.classList.add("destacado-card");
        card.innerHTML = `
            <img src="${info.header_image}" alt="${info.name}">
            <div class="info">
                <h3>${info.name}</h3>
                <p>${info.short_description}</p>
                <p><strong>Valoración:</strong> ${generarEstrellas(info.valoracion)}</p>
            </div>
        `;
        contenedor.appendChild(card);
        juegos.push(card);
    }
    
    // Mostrar el primero
    let index = 0;
    juegos[index].classList.add("activo");

    // Cambiar cada 5 segundos
    setInterval(() => {
        juegos[index].classList.remove("activo");
        index = (index + 1) % juegos.length;
        juegos[index].classList.add("activo");
    }, 7000);
}


// Crea las cards normales (sin animación) para las demás secciones
function crearCardJuego(info) {
    const div = document.createElement("div");
    div.classList.add("juego-card");
    div.innerHTML = `
        <img src="${info.header_image}" alt="${info.name}" class="juego-img">
        <h4>${info.name}</h4>
        <p>${info.short_description}</p>
        <p><strong>Valoración:</strong> ${generarEstrellas(info.valoracion)}</p>
    `;
    return div;
}

async function cargarSeccion(ids, contenedorSelector) {
    const contenedor = document.querySelector(contenedorSelector);
    for (let id of ids) {
        const info = await obtenerJuego(id);
        const card = crearCardJuego(info);
        contenedor.appendChild(card);
    }
}

// ====== CARGA ======
cargarDestacados();
cargarSeccion(topJuegos, ".juegos_top");
cargarSeccion(semanales, ".juegos_semanales");
