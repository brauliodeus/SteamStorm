// ====== VARIABLES (Buscamos los elementos en el HTML) ======
const menu = document.getElementById('menu');
const menuToggle = document.getElementById('menu-toggle');
const perfil = document.getElementById('perfil');
const inicio = document.getElementById('main');
const nosotros = document.getElementById('nosotros');
const soporte = document.getElementById('soporte');
const privacidad = document.getElementById('privacidad');
const cerrarsesion = document.getElementById('cerrarsesion');

// ====== EVENTOS CON PROTECCIÓN (Solo se activan si el elemento existe) ======

// 1. Botón Hamburguesa del Menú
if (menu && menuToggle) {
    menuToggle.addEventListener('click', () => {
        menu.classList.toggle('active');
    });
}

// 2. Botón Perfil
if (perfil) {
    perfil.addEventListener('click', () => console.log('Clic en Perfil'));
}

// 3. Botón Inicio
if (inicio) {
    inicio.addEventListener('click', () => console.log('Clic en Inicio'));
}

// 4. Botón Privacidad
if (privacidad) {
    privacidad.addEventListener('click', () => console.log('Clic en Privacidad'));
}

// 5. Botón Nosotros
if (nosotros) {
    nosotros.addEventListener('click', () => console.log('Clic en Nosotros'));
}

// 6. Botón Soporte
if (soporte) {
    soporte.addEventListener('click', () => console.log('Clic en Soporte'));
}

// 7. LOGOUT (Cerrar Sesión)
if (cerrarsesion) {
    cerrarsesion.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        alert("¡Hasta luego!");
        window.location.href = "../Guest/inicio_guest.html";
    });
}