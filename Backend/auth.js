const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./db'); 

// ==========================================
// 1. REGISTRO DE USUARIO
// ==========================================
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Faltan datos' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener mínimo 6 caracteres' });
  }

  try {
    // Verificar si existe
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Encriptar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Guardar
    await pool.query(
        'INSERT INTO users (username, password) VALUES ($1, $2)', 
        [username, hashedPassword]
    );

    res.status(201).json({ message: 'Usuario registrado exitosamente' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// ==========================================
// 2. INICIAR SESIÓN (LOGIN)
// ==========================================
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Ingresa usuario y contraseña' });
  }

  try {
    // Buscar usuario
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Generar Token (30 min)
    const payload = { user: { id: user.id } };
    
    jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: '30m' }, 
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { id: user.id, username: user.username } 
        });
      }
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// ==========================================
// 3. CAMBIAR CONTRASEÑA (NUEVO)
// ==========================================
router.post('/change-password', async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;

    // Validaciones básicas
    if (!username || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Por favor rellena todos los campos.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        // 1. Buscar al usuario
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const user = result.rows[0];

        // 2. Verificar que la contraseña VIEJA sea correcta
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'La contraseña actual es incorrecta.' });
        }

        // 3. Encriptar la NUEVA contraseña
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Actualizar en la Base de Datos
        await pool.query('UPDATE users SET password = $1 WHERE username = $2', [newHashedPassword, username]);

        res.json({ message: '¡Contraseña actualizada con éxito!' });

    } catch (err) {
        console.error("Error cambiando password:", err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;