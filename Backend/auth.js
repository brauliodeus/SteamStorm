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

    // Guardar (Por defecto la base de datos pondrá el role como 'user')
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

    // --- AQUÍ ESTÁ EL CAMBIO PARA ADMIN ---
    // Incluimos el ROL dentro del token
    const payload = { 
        user: { 
            id: user.id,
            role: user.role // Guardamos si es 'admin' o 'user'
        } 
    };
    
    jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: '30m' }, 
      (err, token) => {
        if (err) throw err;
        // Devolvemos el token Y el rol al frontend
        res.json({ 
          token, 
          user: { 
              id: user.id, 
              username: user.username,
              role: user.role // Enviamos el rol para que el JS sepa qué menú mostrar
          } 
        });
      }
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// ==========================================
// 3. CAMBIAR CONTRASEÑA
// ==========================================
router.post('/change-password', async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;

    if (!username || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Por favor rellena todos los campos.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'La contraseña actual es incorrecta.' });
        }

        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE users SET password = $1 WHERE username = $2', [newHashedPassword, username]);

        res.json({ message: '¡Contraseña actualizada con éxito!' });

    } catch (err) {
        console.error("Error cambiando password:", err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// ==========================================
// 4. ELIMINAR USUARIO (SOLO ADMININISTRADOR)
// ==========================================
router.delete('/delete', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: 'Faltan datos.' });
    }

    try {
        // Borrar datos asociados primero
        await pool.query('DELETE FROM wishlist WHERE username = $1', [username]);
        await pool.query('DELETE FROM reviews WHERE username = $1', [username]);
        
        // Borrar usuario
        const result = await pool.query('DELETE FROM users WHERE username = $1', [username]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.json({ message: `Usuario ${username} eliminado.` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al eliminar usuario.' });
    }
});

module.exports = router;