const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'seuSegredoAqui';

router.post('/', async (req, res) => {
    console.log('Requisição de login recebida:', req.body);
    const { email, senha } = req.body;

    try {
        const query = 'SELECT * FROM usuarios WHERE email = $1';
        const { rows } = await pool.query(query, [email]);

        if (rows.length === 0) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado',
            });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(senha, user.senha_hash);

        if (!isMatch) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Credenciais inválidas',
            });
        }

        // Cria o token JWT
        const payload = {
            id: user.id,
            email: user.email,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        return res.json({
            sucesso: true,
            mensagem: 'Login bem-sucedido',
            token, // envia o token para o cliente
            user: {
                email: user.email,
                id: user.id,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao autenticar o usuário',
        });
    }
});

module.exports = router;
