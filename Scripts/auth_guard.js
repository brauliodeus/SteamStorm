// auth_guard.js


// 1. Busca el token
const token = localStorage.getItem('token');

// 2. Si NO hay token (es null o vacío)...
if (!token) {
    alert("⛔ Acceso denegado. ¡Debes iniciar sesión primero!");
    
    // De vuelta a la entrada (Login)
    window.location.href = "../Guest/iniciosesion.html";
}