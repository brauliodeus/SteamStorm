// ====== CONFIGURACIÓN ======
// Mantenemos API_URL solo para cosas de usuario, no para juegos
const API_URL = "https://steamstorm.onrender.com"; 
const semanales = [1687950, 367520, 1145360, 413150,1593500]; 

// ====== NUEVA LÓGICA: MODO LOCAL DIRECTO ======
// Ya no usamos fetch() para los juegos. Vamos directo al grano.

async function obtenerJuego(appid) {
    // Verificamos si el archivo de backup está cargado
    if (typeof buscarEnBackup === 'function') {
        const juego = buscarEnBackup(appid);
        if (juego) return juego;
    }
    console.error("Juego no encontrado en backup local:", appid);
    return null;
}

async function obtenerJuegosTop() {
    // Devolvemos la lista local directamente
    if (typeof BACKUP_GAMES !== 'undefined') {
        return BACKUP_GAMES;
    }
    console.error("¡ERROR CRÍTICO! El archivo datos_backup.js no se ha cargado.");
    return [];
}

// ====== FUNCIONES VISUALES (Estrellas y Tarjetas) ======
function generarEstrellas(porcentaje) {
    const score = Math.max(0, Math.min(100, parseInt(porcentaje) || 0));
    const estrellasLlenas = Math.round(score / 20);
    let html = "";
    for (let i = 1; i <= 5; i++) html += `<i class="${i <= estrellasLlenas ? "fas" : "far"} fa-star" style="color: gold;"></i>`;
    return `${html} <span style="color:#D9D9D9; font-size:0.9em;">(${score}%)</span>`;
}

function crearCard(info, esDestacado = false) {
    if (!info) return document.createElement('div');

    const div = document.createElement("div");
    div.classList.add(esDestacado ? "destacado-card" : "juego-card");
    
    const colorTitulo = esDestacado ? "gold" : "white";

    div.innerHTML = `
        <img src="${info.header_image}" alt="${info.name}">
        <div class="info">
            <h4 style="color:${colorTitulo}">${info.name}</h4>
            <p>${info.short_description}</p>
            <p class="votos">${generarEstrellas(info.porcentaje_positivo)}</p>
        </div>
    `;
    
    const targetUrl = window.location.pathname.includes("/User/") ? `detalle.html?id=${info.appid}` : `../Guest/detalle.html?id=${info.appid}`;
    div.addEventListener("click", () => window.location.href = targetUrl);
    return div;
}

// ====== CARGAR TODO (Instantáneo) ======
async function cargarTodo() {
    // Obtenemos datos locales (0 ms de espera)
    const juegosTop = await obtenerJuegosTop();
    
    // 1. SECCIÓN DESTACADOS (Primeros 4)
    const contDestacados = document.querySelector(".juegos_destacados");
    if (contDestacados) {
        contDestacados.innerHTML = "";
        juegosTop.slice(0, 3).forEach(j => contDestacados.appendChild(crearCard(j, true)));
    }
    
    // 2. SECCIÓN TOP JUEGOS (Resto)
    const contTop = document.querySelector(".juegos_semanales");
    if (contTop) {
        contTop.innerHTML = "";
        juegosTop.slice(4).forEach(j => contTop.appendChild(crearCard(j, false)));
    }

    // 3. SECCIÓN SEMANALES
    const contSemanales = document.querySelector(".juegos_top");
    if (contSemanales) {
        contSemanales.innerHTML = "";
        for (let id of semanales) {
            const info = await obtenerJuego(id);
            if(info) contSemanales.appendChild(crearCard(info, false));
        }
    }
}

document.addEventListener("DOMContentLoaded", cargarTodo);  