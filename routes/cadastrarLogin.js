const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();

router.post('/', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        const result = await pool.query(
            'INSERT INTO usuarios (email, senha_hash) VALUES ($1, $2) RETURNING id, email',
            [email, senhaHash]
        );

        const user = result.rows[0];

        res.status(201).json({
            sucesso: true,
            mensagem: 'Usuário cadastrado com sucesso!',
            user: {
                email: user.email,
                id: user.id,
            },
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao cadastrar usuário.' });
    }
});

module.exports = router;
