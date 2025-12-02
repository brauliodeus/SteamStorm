const BACKUP_GAMES = [
    // === JUEGOS DESTACADOS (Los 4 primeros) ===
    { 
        appid: 413150, 
        name: "Stardew Valley", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg", 
        short_description: "Acabas de heredar la vieja parcela agrícola de tu abuelo. ¿Podrás aprender a vivir de la tierra?", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Indie", "Simulación"] 
    },
    { 
        appid: 883710, 
        name: "Resident Evil 2", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/883710/header.jpg", 
        short_description: "El regreso de un clásico del terror. Sobrevive al apocalipsis zombi en Raccoon City.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Acción", "Terror"] 
    },
    { 
        appid: 1687950, 
        name: "Persona 5 Royal", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1687950/header.jpg", 
        short_description: "Ponte la máscara. Únete a los Ladrones Fantasma de Corazones y cambia el mundo.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Rol", "Anime"] 
    },
    { 
        appid: 1817070, 
        name: "Marvel’s Spider-Man Remastered", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1817070/header.jpg", 
        short_description: "Juega como un Peter Parker veterano que ha perfeccionado sus habilidades en la lucha contra el crimen.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Acción", "Mundo Abierto"] 
    },

    // === TOP JUEGOS (El resto de la lista) ===
    { 
        appid: 1086940, 
        name: "Baldur's Gate 3", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg", 
        short_description: "Reúne a tu grupo y regresa a los Reinos Olvidados en una historia de compañerismo y traición.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Aventura", "Rol"] 
    },
    { 
        appid: 1593500, 
        name: "God of War", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg", 
        short_description: "Kratos, que vive como un hombre fuera de la sombra de los dioses, se adentra en tierras nórdicas.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Acción", "Aventura"] 
    },
    { 
        appid: 2050650, 
        name: "Resident Evil 4", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg", 
        short_description: "La supervivencia es solo el principio. Leon S. Kennedy debe rescatar a la hija del presidente.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Acción", "Terror"] 
    },
    { 
        appid: 1145360, 
        name: "Hades", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg", 
        short_description: "Desafía al dios de los muertos y protagoniza una escapada salvaje del Inframundo.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Acción", "Roguelike"] 
    },
    { 
        appid: 620, 
        name: "Portal 2", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620/header.jpg", 
        short_description: "La Iniciativa de Pruebas Perpetuas ha sido ampliada para permitirte diseñar puzles cooperativos.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Acción", "Puzle"] 
    },
    { 
        appid: 367520, 
        name: "Hollow Knight", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg", 
        short_description: "¡Forja tu propio camino en Hollow Knight! Una aventura épica a través de un vasto reino de insectos.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Acción", "Metroidvania"] 
    },
    { 
        appid: 550, 
        name: "Left 4 Dead 2", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/550/header.jpg", 
        short_description: "Ambientado en el apocalipsis zombi, es la esperadísima secuela del galardonado Left 4 Dead.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Acción", "Zombis"] 
    },
    { 
        appid: 105600, 
        name: "Terraria", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/header.jpg", 
        short_description: "¡Cava, lucha, explora, construye! Nada es imposible en este juego de aventuras lleno de acción.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 98, genres: ["Acción", "Aventura"] 
    },
    { 
        appid: 292030, 
        name: "The Witcher 3: Wild Hunt", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg", 
        short_description: "Eres Geralt de Rivia, cazador de monstruos. Ante ti se extiende un continente devastado por la guerra.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 98, genres: ["Rol", "Mundo Abierto"] 
    },
    { 
        appid: 814380, 
        name: "Sekiro™: Shadows Die Twice", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg", 
        short_description: "Explora el Japón de la era Sengoku mientras te enfrentas a enemigos colosales en un mundo oscuro.", 
        valoracion: "Very Positive", porcentaje_positivo: 98, genres: ["Acción", "Difícil"] 
    },
    { 
        appid: 374320, 
        name: "DARK SOULS™ III", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/374320/header.jpg", 
        short_description: "Adéntrate en un universo lleno de enemigos y entornos colosales, un mundo en ruinas.", 
        valoracion: "Very Positive", porcentaje_positivo: 97, genres: ["Acción", "Rol"] 
    },
    { 
        appid: 1245620, 
        name: "ELDEN RING", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg", 
        short_description: "Levántate, tiznado, y déjate guiar por la gracia para esgrimir el poder del Anillo de Elden.", 
        valoracion: "Very Positive", porcentaje_positivo: 97, genres: ["Acción", "RPG"] 
    },
    { 
        appid: 1174180, 
        name: "Red Dead Redemption 2", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg", 
        short_description: "Arthur Morgan y la banda de Van der Linde se ven obligados a huir. Una historia épica.", 
        valoracion: "Very Positive", porcentaje_positivo: 97, genres: ["Acción", "Aventura"] 
    },
    { 
        appid: 582010, 
        name: "Monster Hunter: World", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/582010/header.jpg", 
        short_description: "¡Bienvenidos al Nuevo Mundo! Asume el papel de un cazador y mata monstruos feroces.", 
        valoracion: "Very Positive", porcentaje_positivo: 96, genres: ["Acción", "RPG"] 
    },
    { 
        appid: 945360, 
        name: "Among Us", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/945360/header.jpg", 
        short_description: "Un juego de trabajo en equipo y traición en el espacio para 4-15 jugadores.", 
        valoracion: "Very Positive", porcentaje_positivo: 94, genres: ["Casual", "Social"] 
    },
    { 
        appid: 271590, 
        name: "Grand Theft Auto V", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg", 
        short_description: "Un joven estafador, un ladrón de bancos retirado y un psicópata aterrador.", 
        valoracion: "Very Positive", porcentaje_positivo: 93, genres: ["Acción", "Mundo Abierto"] 
    },
    { 
        appid: 570, 
        name: "Dota 2", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/570/header.jpg", 
        short_description: "Cada día, millones de jugadores de todo el mundo entran en batalla como uno de los héroes de Dota.", 
        valoracion: "Very Positive", porcentaje_positivo: 93, genres: ["Acción", "Estrategia"] 
    },
    { 
        appid: 1172470, 
        name: "Apex Legends™", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/header.jpg", 
        short_description: "Domina con estilo en Apex Legends, un shooter Battle Royale Free-to-Play.", 
        valoracion: "Mostly Positive", porcentaje_positivo: 92, genres: ["Acción", "FPS"] 
    },
    { 
        appid: 252490, 
        name: "Rust", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252490/header.jpg", 
        short_description: "El único objetivo en Rust es sobrevivir. Supera el hambre, la sed y el frío.", 
        valoracion: "Very Positive", porcentaje_positivo: 92, genres: ["Acción", "Survival"] 
    },
    { 
        appid: 1091500, 
        name: "Cyberpunk 2077", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg", 
        short_description: "Cyberpunk 2077 es un RPG de acción y aventura de mundo abierto ambientado en Night City.", 
        valoracion: "Very Positive", porcentaje_positivo: 91, genres: ["Rol", "Futurista"] 
    }
];

// Función para que el script encuentre los datos
function buscarEnBackup(id) {
    if (!id) return BACKUP_GAMES;
    return BACKUP_GAMES.find(g => String(g.appid) === String(id));
}

const input = document.getElementById("buscador");
const contenedor = document.getElementById("resultados");

// Ocultar resultados al iniciar
contenedor.style.display = "none";

// Detecta escritura en el buscador
input.addEventListener("input", () => {
    const texto = input.value.toLowerCase();

    // Si está vacío → oculta contenedor y no muestra nada
    if (texto.trim() === "") {
        contenedor.innerHTML = "";
        contenedor.style.display = "none";
        return;
    }

    const filtrados = BACKUP_GAMES.filter(juego =>
        juego.name.toLowerCase().includes(texto) ||
        juego.genres.join(" ").toLowerCase().includes(texto)
    );

    mostrarResultados(filtrados);
});


// Función para renderizar resultados
function mostrarResultados(lista){
    contenedor.innerHTML = ""; // Limpia resultados previos

    // Mostrar contenedor al buscar
    contenedor.style.display = "block";

    if(lista.length === 0){
        contenedor.innerHTML = "<p>No se encontraron resultados...</p>";
        return;
    }

    lista.forEach(juego => {
        const div = document.createElement("div");
        div.style.cursor = "pointer"; // hace clickeable

        div.innerHTML = `
            <div style="display:flex;align-items:center;margin:6px;padding:6px;border-radius:5px;">
                <img src="${juego.header_image}" width="120" style="border-radius:5px;margin-right:12px;">
                <div>
                    <h3>${juego.name}</h3>
                    <p>${juego.short_description}</p>
                    <b>⭐ ${juego.valoracion} (${juego.porcentaje_positivo}% positivos)</b><br>
                    <small>Géneros: ${juego.genres.join(", ")}</small>
                </div>
            </div>
        `;

        // 🔥 Redirigir al HTML del detalle del juego al hacer click
        div.addEventListener("click", () => {
            window.location.href = `detalle.html?id=${encodeURIComponent(juego.appid)}`;
        });

        contenedor.appendChild(div);
    });
}
