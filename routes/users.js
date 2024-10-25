const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Ruta para mostrar el formulario de registro
router.get('/register', (req, res) => {
    res.render('register');
});

// Ruta para manejar el registro de usuarios
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.render('register', { error: 'Todos los campos son obligatorios' });
    }
    
    bcrypt.hash(password, 10, (err, hash) => {
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hash], (err) => {
            if (err) {
                return res.render('register', { error: 'El usuario ya existe' });
            }
            res.redirect('/login');
        });
    });
});

// Ruta para mostrar el formulario de login
router.get('/login', (req, res) => {
    res.render('login');
});

// Ruta para manejar el login de usuarios
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (!user) {
            return res.render('login', { error: 'Usuario o contraseña incorrectos' });
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                req.session.userId = user.id;
                res.redirect('/forum');
            } else {
                res.render('login', { error: 'Usuario o contraseña incorrectos' });
            }
        });
    });
});

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
