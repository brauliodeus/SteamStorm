// ====== CONFIGURACIÓN Y LISTAS ======
const semanales = [292030, 1174180, 945360]; // Witcher 3, RDR2, Among Us

// ====== FUNCIONES ======
async function obtenerJuego(appid) {
    const res = await fetch(`http://localhost:3000/api/game/${appid}`);
    return await res.json();
}

async function obtenerJuegosTop() {
    const res = await fetch("http://localhost:3000/api/top-games");
    return await res.json();
}

// Convierte valoración en estrellas
function generarEstrellas(valoracion) {
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
    const porcentaje = typeof valoracion === "string" ? (mapping[valoracion] || 50) : valoracion;
    const estrellasLlenas = Math.round(porcentaje / 20);
    let estrellasHTML = "";
    for (let i = 1; i <= 5; i++) {
        estrellasHTML += `<i class="fa${i <= estrellasLlenas ? "s" : "r"} fa-star" style="color: gold;"></i>`;
    }
    return `${estrellasHTML} <span style="color:#D9D9D9;">(${porcentaje}%)</span>`;
}

// ====== CREACIÓN DE CARDS ======
function crearCardJuego(info) {
    const div = document.createElement("div");
    div.classList.add("juego-card");
    div.innerHTML = `
        <img src="${info.header_image}" alt="${info.name}" class="juego-img">
        <h4>${info.name}</h4>
        <p><strong>Género:</strong> ${info.genres && info.genres.length > 0 ? info.genres.join(", ") : "Desconocido"}</p>
        <p><strong>Valoración:</strong> ${generarEstrellas(info.porcentaje_positivo)}</p>
    `;
    // 🔗 Permite pinchar solo los juegos normales y top
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
    // 🚫 No agregamos click para los destacados
    return div;
}

// ====== CARGA DE SECCIONES ======
async function cargarDestacados() {
    const contenedor = document.querySelector(".juegos_destacados");
    contenedor.innerHTML = "<p>Cargando juegos destacados...</p>";
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

        let index = 0;
        juegos[index].classList.add("activo");

        setInterval(() => {
            juegos[index].classList.remove("activo");
            index = (index + 1) % juegos.length;
            juegos[index].classList.add("activo");
        }, 7000);
    } catch (err) {
        contenedor.innerHTML = "<p style='color:red;'>Error al cargar destacados.</p>";
    }
}

async function cargarTopJuegos() {
    const contenedor = document.querySelector(".juegos_top");
    contenedor.innerHTML = "<p>Cargando juegos top juegos...</p>";
    try {
        const juegosTop = await obtenerJuegosTop();
        contenedor.innerHTML = "";
        for (const juego of juegosTop) {
            contenedor.appendChild(crearCardJuego(juego));
        }
    } catch (err) {
        contenedor.innerHTML = "<p style='color:red;'>Error al cargar top juegos.</p>";
    }
}

async function cargarSeccion(ids, selector) {
    const contenedor = document.querySelector(selector);
    for (let id of ids) {
        const info = await obtenerJuego(id);
        contenedor.appendChild(crearCardJuego(info));
    }
}

async function cargarDetalle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;

    const res = await fetch(`http://localhost:3000/api/game/${id}`);
    const data = await res.json();
    
    const div = document.createElement("div");
    div.classList.add("destacado-card");
    document.getElementById("detalle").innerHTML = `
        <h1>${data.name}</h1>
        <img src="${data.header_image}" style="width:60%; border-radius:5px;">
        <p style="display:block;">${data.short_description}</p>
        <p><strong>Valoración:</strong> ${data.valoracion} (${data.porcentaje_positivo}%)</p>
        <p><strong>Total de reseñas:</strong> ${data.total_reviews}</p>
    `;
}

// ====== EJECUCIÓN ======
cargarDestacados();
cargarTopJuegos();
cargarSeccion(semanales, ".juegos_semanales");
cargarDetalle();