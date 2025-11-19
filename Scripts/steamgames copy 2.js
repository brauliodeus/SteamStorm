// ====== IDS DE JUEGOS ======
//const destacados = [730, 570, 440]; // CS2, Dota 2, TF2
const semanales = [292030, 1174180, 945360]; // Witcher 3, RDR2, Among Us

// ====== FUNCIONES ======

// Obtiene datos desde tu backend Node (para imágenes, descripciones, etc.)
async function obtenerJuego(appid) {
    const res = await fetch(`http://localhost:3000/api/game/${appid}`);
    const data = await res.json();
    return data;
}

// Obtiene los juegos mejor valorados desde tu backend
async function obtenerJuegosTop() {
    const res = await fetch("http://localhost:3000/api/top-games");
    const data = await res.json();
    return data;
}

// Convierte porcentaje o tipo textual a estrellas
function generarEstrellas(valoracion) {
    let porcentaje;

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
            <p><strong>Valoración:</strong> ${generarEstrellas(info.porcentaje_positivo)}</p>
        </div>
    `;
    return div;
}

// Carga los destacados con efecto rotatorio
// 🚀 Carga los 3 juegos destacados automáticamente desde el top del backend
async function cargarDestacados() {
    const contenedor = document.querySelector(".juegos_destacados");
    contenedor.innerHTML = "<p>Cargando juegos destacados...</p>";

    try {
        // 1️⃣ Obtener todos los top games desde el backend
        const juegosTop = await obtenerJuegosTop();

        // 2️⃣ Tomar solo los 3 primeros
        const top3 = juegosTop.slice(0, 3);

        contenedor.innerHTML = "";
        const juegos = [];

        // 3️⃣ Crear las cards con animación rotatoria
        for (const juego of top3) {
            const card = crearCardDestacado(juego);
            contenedor.appendChild(card);
            juegos.push(card);
        }

        // 4️⃣ Mostrar el primero y rotar cada 7 segundos
        let index = 0;
        juegos[index].classList.add("activo");

        setInterval(() => {
            juegos[index].classList.remove("activo");
            index = (index + 1) % juegos.length;
            juegos[index].classList.add("activo");
        }, 7000);

    } catch (err) {
        console.error("❌ Error al cargar destacados:", err);
        contenedor.innerHTML = "<p style='color:red;'>Error al cargar destacados.</p>";
    }
}

// Crea las cards normales (sin animación)
function crearCardJuego(info) {
    const div = document.createElement("div");
    div.classList.add("juego-card");
    div.innerHTML = `
        <img src="${info.header_image}" alt="${info.name}" class="juego-img">
        <h4>${info.name}</h4>
        <p>${info.short_description}</p>
        <p><strong>Valoración:</strong> ${generarEstrellas(info.porcentaje_positivo)}</p>
    `;
    return div;
}

// Carga los juegos semanales (usa tus IDs)
async function cargarSeccion(ids, contenedorSelector) {
    const contenedor = document.querySelector(contenedorSelector);
    for (let id of ids) {
        const info = await obtenerJuego(id);
        const card = crearCardJuego(info);
        contenedor.appendChild(card);
    }
}

// 🚀 Carga los juegos mejor valorados desde tu backend
async function cargarTopJuegos() {
    const contenedor = document.querySelector(".juegos_top");
    contenedor.innerHTML = "<p>Cargando juegos mejor valorados...</p>";

    try {
        const juegosTop = await obtenerJuegosTop();
        contenedor.innerHTML = "";

        for (const juego of juegosTop) {
            const card = crearCardJuego(juego, juego.porcentaje_positivo);
            contenedor.appendChild(card);
        }
    } catch (err) {
        contenedor.innerHTML = "<p style='color:red;'>Error al cargar los juegos top.</p>";
        console.error("❌ Error al cargar los juegos top:", err);
    }
}

// ====== CARGA ======
cargarDestacados();
cargarTopJuegos(); // se genera dinámicamente con tu backend
cargarSeccion(semanales, ".juegos_semanales");
