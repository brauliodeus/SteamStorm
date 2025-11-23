const API_URL = "https://steamstorm.onrender.com"; 
const semanales = [292030, 1174180, 945360]; 

// ====== 1. FUNCIÓN DE DATOS (HÍBRIDA: SERVER + BACKUP) ======
async function fetchData(endpoint, backupId = null) {
    try {
        // Intentamos servidor
        const res = await fetch(`${API_URL}${endpoint}`);
        if (!res.ok) throw new Error("Server Error");
        const data = await res.json();
        if (Array.isArray(data) && data.length === 0) throw new Error("Lista vacía");
        return data;
    } catch (error) {
        // Si falla, usamos respaldo local
        if (typeof buscarEnBackup === 'function') return buscarEnBackup(backupId);
        return null;
    }
}

async function obtenerJuego(appid) { return await fetchData(`/api/game/${appid}`, appid); }
async function obtenerJuegosTop() { return await fetchData(`/api/top-games`); }

// ====== 2. CREAR TARJETAS VISUALES ======
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
    // Usamos "juego-card" para todos para que se vean uniformes en el grid
    div.classList.add("juego-card");
    
    // Si es destacado, le podemos dar un borde diferente o título de color (opcional)
    const colorTitulo = esDestacado ? "#66fcf1" : "white";

    div.innerHTML = `
        <img src="${info.header_image}" alt="${info.name}" class="juego-img">
        <div class="info" style="padding:10px;">
            <h4 style="margin:10px 0; color:${colorTitulo};">${info.name}</h4>
            <p style="font-size:0.9em; color:#aaa;">${info.genres ? info.genres[0] : "Juego"}</p>
            <p>${generarEstrellas(info.porcentaje_positivo)}</p>
        </div>
    `;
    
    const targetUrl = window.location.pathname.includes("/User/") ? `detalle.html?id=${info.appid}` : `../Guest/detalle.html?id=${info.appid}`;
    div.addEventListener("click", () => window.location.href = targetUrl);
    return div;
}

// ====== 3. CARGAR TODO EN PANTALLA ======
async function cargarTodo() {
    // Pedimos la lista gigante (Server o Backup)
    const juegosTop = await obtenerJuegosTop() || [];
    
    // A. SECCIÓN DESTACADOS (Los primeros 4 juegos)
    const contDestacados = document.querySelector(".juegos_destacados");
    if (contDestacados) {
        contDestacados.innerHTML = "";
        // Tomamos del 0 al 4
        juegosTop.slice(0, 4).forEach(j => {
            // True indica que es destacado (titulo celeste)
            contDestacados.appendChild(crearCard(j, true));
        });
    }
    
    // B. SECCIÓN TOP JUEGOS (El resto)
    const contTop = document.querySelector(".juegos_top");
    if (contTop) {
        contTop.innerHTML = "";
        // Tomamos del 4 en adelante
        juegosTop.slice(4).forEach(j => {
            contTop.appendChild(crearCard(j, false));
        });
    }

    // C. SECCIÓN SEMANALES (Manuales)
    const contSemanales = document.querySelector(".juegos_semanales");
    if (contSemanales) {
        contSemanales.innerHTML = "";
        for (let id of semanales) {
            const info = await obtenerJuego(id);
            if(info) contSemanales.appendChild(crearCard(info, false));
        }
    }
}

document.addEventListener("DOMContentLoaded", cargarTodo);