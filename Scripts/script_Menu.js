// ====== SELECCIÓN DE ELEMENTOS ======
const menu = document.getElementById('menu');
const menuToggle = document.getElementById('menu-toggle');
const perfil = document.getElementById('perfil');
const inicio = document.getElementById('main'); 
const nosotros = document.getElementById('nosotros');
const soporte = document.getElementById('soporte');
const privacidad = document.getElementById('privacidad');
const cerrarsesion = document.getElementById('cerrarsesion');

// ====== EVENTOS SEGUROS (Verificamos con 'if' si existen) ======

if (menu && menuToggle) {
    menuToggle.addEventListener('click', () => {
        menu.classList.toggle('active');
    });
}

if (perfil) {
    perfil.addEventListener('click', () => console.log('Clic en Perfil'));
}

if (inicio) {
    inicio.addEventListener('click', () => console.log('Clic en Inicio'));
}

if (privacidad) {
    privacidad.addEventListener('click', () => console.log('Clic en Privacidad'));
}

if (nosotros) {
    nosotros.addEventListener('click', () => console.log('Clic en Nosotros'));
}

if (soporte) {
    soporte.addEventListener('click', () => console.log('Clic en Soporte'));
}

// LOGOUT: Solo agregamos el evento si el botón existe
if (cerrarsesion) {
    cerrarsesion.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        alert("¡Hasta luego!");
        window.location.href = "../Guest/inicio_guest.html";
    });
}