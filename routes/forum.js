const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Mostrar lista de preguntas
router.get('/', (req, res) => {
    db.all(`SELECT questions.id, title, username FROM questions JOIN users ON questions.user_id = users.id`, [], (err, questions) => {
        res.render('forum', { questions });
    });
});

// Mostrar formulario para nueva pregunta
router.get('/ask', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.render('ask');
});

// Publicar nueva pregunta
router.post('/ask', (req, res) => {
    const { title, content } = req.body;
    const userId = req.session.userId;
    if (!userId) return res.redirect('/login');
    
    db.run(`INSERT INTO questions (user_id, title, content) VALUES (?, ?, ?)`, [userId, title, content], (err) => {
        if (err) return res.redirect('/forum');
        res.redirect('/forum');
    });
});

// Ver una pregunta y sus respuestas
router.get('/question/:id', (req, res) => {
    const questionId = req.params.id;

    db.get(`SELECT * FROM questions WHERE id = ?`, [questionId], (err, question) => {
        db.all(`SELECT * FROM answers WHERE question_id = ?`, [questionId], (err, answers) => {
            res.render('question', { question, answers });
        });
    });
});

// Responder a una pregunta
router.post('/answer/:id', (req, res) => {
    const questionId = req.params.id;
    const { content } = req.body;
    const userId = req.session.userId;
    
    if (!userId) return res.redirect('/login');

    db.run(`INSERT INTO answers (question_id, user_id, content) VALUES (?, ?, ?)`, [questionId, userId, content], (err) => {
        if (err) return res.redirect(`/forum/question/${questionId}`);
        res.redirect(`/forum/question/${questionId}`);
    });
});

module.exports = router;
