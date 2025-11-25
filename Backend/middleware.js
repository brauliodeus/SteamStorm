const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // 1. Leer el token del header
    const token = req.header('x-auth-token');

    // 2. Si no hay token, fuera
    if (!token) {
        return res.status(401).json({ msg: 'No hay token, permiso denegado' });
    }

    try {
        // 3. Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Verificar si es ADMIN
        if (decoded.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Acceso denegado: Requiere ser Administrador' });
        }

        req.user = decoded.user;
        next(); // Puede pasar
    } catch (err) {
        res.status(401).json({ msg: 'Token no válido' });
    }
};