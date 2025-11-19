const menu = document.getElementById('menu');
const menuToggle = document.getElementById('menu-toggle');
const perfil = document.getElementById('perfil');
const inicio = document.getElementById('main');
const nosotros = document.getElementById('nosotros');
//const direcciones = document.getElementById('billetera');
const soporte = document.getElementById('soporte');
const privacidad = document.getElementById('privacidad');
//const cerrarsesion = document.getElementById('cerrarsesion');

menuToggle.addEventListener('click', () => {
    menu.classList.toggle('active');
});

perfil.addEventListener('click', () => {
    console.log('Clic en Perfil');
});

inicio.addEventListener('click', () => {
    console.log('Clic en Config');
});

privacidad.addEventListener('click', () => {
    console.log('Clic en Ganancias');
});

nosotros.addEventListener('click', () => {
    console.log('Clic en Billetera');
});

soporte.addEventListener('click', () => {
    console.log('Clic en soporte');
});

//politica.addEventListener('click', () => {
    //console.log('Clic en politica ');
//});

//cerrarsesion.addEventListener('click', () => {
    //console.log('Clic en cerrarcesion ');
//});