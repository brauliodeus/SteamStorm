const BACKUP_GAMES = [
    // ======================================================
    // SECCIÓN 1: DESTACADOS
    // ======================================================
    { 
        appid: 413150, 
        name: "Stardew Valley", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg", 
        short_description: "Acabas de heredar la vieja parcela agrícola de tu abuelo. ¿Podrás aprender a vivir de la tierra y convertir estos campos descuidados en un hogar próspero?", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Indie", "Granja"] 
    },
    { 
        appid: 883710, 
        name: "Resident Evil 2", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/883710/header.jpg", 
        short_description: "El regreso de un clásico del terror. Sobrevive al apocalipsis zombi en Raccoon City con gráficos modernos y una jugabilidad aterradora.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Acción", "Terror"] 
    },
    { 
        appid: 1687950, 
        name: "Persona 5 Royal", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1687950/header.jpg", 
        short_description: "Ponte la máscara. Únete a los Ladrones Fantasma de Corazones y rompe las cadenas de la sociedad moderna en esta aclamada aventura RPG.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Rol", "Anime"] 
    },
    { 
        appid: 1817070, 
        name: "Marvel’s Spider-Man Remastered", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1817070/header.jpg", 
        short_description: "Juega como un Peter Parker veterano que ha perfeccionado sus habilidades en la lucha contra el crimen en la Nueva York de Marvel.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Acción", "Mundo Abierto"] 
    },

    // ======================================================
    // SECCIÓN 2: TOP JUEGOS
    // ======================================================
    { 
        appid: 1086940, 
        name: "Baldur's Gate 3", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg", 
        short_description: "Reúne a tu grupo y regresa a los Reinos Olvidados en una historia de compañerismo y traición, sacrificio y supervivencia.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Aventura", "RPG"] 
    },
    { 
        appid: 1593500, 
        name: "God of War", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg", 
        short_description: "Kratos, que vive como un hombre fuera de la sombra de los dioses, debe adaptarse a tierras desconocidas junto a su hijo Atreus.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Acción", "Aventura"] 
    },
    { 
        appid: 2050650, 
        name: "Resident Evil 4", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg", 
        short_description: "La supervivencia es solo el principio. Seis años después de la catástrofe biológica en Raccoon City, Leon S. Kennedy rastrea a la hija del presidente.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Acción", "Terror"] 
    },
    { 
        appid: 1145360, 
        name: "Hades", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg", 
        short_description: "Desafía al dios de los muertos y protagoniza una escapada salvaje del Inframundo en este roguelike de los creadores de Bastion.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Acción", "Roguelike"] 
    },
    { 
        appid: 620, 
        name: "Portal 2", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620/header.jpg", 
        short_description: "La Iniciativa de Pruebas Perpetuas ha sido ampliada para permitirte diseñar puzles cooperativos para ti y tus amigos.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 99, genres: ["Acción", "Puzle"] 
    },
    { 
        appid: 367520, 
        name: "Hollow Knight", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg", 
        short_description: "¡Forja tu propio camino en Hollow Knight! Una aventura épica a través de un vasto reino de insectos y héroes en ruinas.", 
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
        short_description: "Eres Geralt de Rivia, cazador de monstruos. Ante ti se extiende un continente devastado por la guerra e infestado de criaturas.", 
        valoracion: "Overwhelmingly Positive", porcentaje_positivo: 98, genres: ["Rol", "Aventura"] 
    },
    { 
        appid: 814380, 
        name: "Sekiro™: Shadows Die Twice", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg", 
        short_description: "Explora el Japón de la era Sengoku de finales del siglo XVI mientras te enfrentas a enemigos colosales.", 
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
        short_description: "Arthur Morgan y la banda de Van der Linde se ven obligados a huir. Una historia épica en el corazón de América.", 
        valoracion: "Very Positive", porcentaje_positivo: 97, genres: ["Acción", "Aventura"] 
    },
    { 
        appid: 582010, 
        name: "Monster Hunter: World", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/582010/header.jpg", 
        short_description: "¡Bienvenidos al Nuevo Mundo! En Monster Hunter: World, asume el papel de un cazador y mata monstruos feroces.", 
        valoracion: "Very Positive", porcentaje_positivo: 96, genres: ["Acción", "Co-op"] 
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
        short_description: "Un joven estafador callejero, un ladrón de bancos retirado y un psicópata aterrador se meten en lo peor del mundo criminal.", 
        valoracion: "Very Positive", porcentaje_positivo: 93, genres: ["Acción", "Mundo Abierto"] 
    },
    { 
        appid: 570, 
        name: "Dota 2", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/570/header.jpg", 
        short_description: "Cada día, millones de jugadores de todo el mundo entran en batalla como uno de los más de cien héroes de Dota.", 
        valoracion: "Very Positive", porcentaje_positivo: 93, genres: ["Acción", "Estrategia"] 
    },
    { 
        appid: 1172470, 
        name: "Apex Legends™", 
        header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/header.jpg", 
        short_description: "Domina con estilo en Apex Legends, un shooter Battle Royale Free-to-Play.", 
        valoracion: "Very Positive", porcentaje_positivo: 92, genres: ["Acción", "FPS"] 
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

// Función global para buscar
function buscarEnBackup(id) {
    if (!id) return BACKUP_GAMES;
    // Compara como string o número para evitar errores de tipo
    return BACKUP_GAMES.find(g => g.appid == id);
}