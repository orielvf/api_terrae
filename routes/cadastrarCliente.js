const express = require('express');
const pool = require('../db');
const router = express.Router();

router.post('/', async (req, res) => {
    const { nome, email, telefone, descricao, usuario_id, pendente, apoiador, promotor, retrator } = req.body;

    console.log('Requisição recebida:', req.body);

    if (!usuario_id || !nome) {
        console.log('Erro: Usuário não identificado ou nome não fornecido');
        return res.status(400).json({ sucesso: false, mensagem: 'Usuário não identificado.' });
    }

    try {
        console.log('Iniciando inserção no banco de dados...');
        const result = await pool.query(
            `INSERT INTO clientes 
            (nome, email, telefone, descricao, usuario_id, pendente, apoiador, promotor, retrator) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [nome, email, telefone, descricao, usuario_id, pendente, apoiador, promotor, retrator]
        );

        console.log('Cliente cadastrado com sucesso:', result);

        res.status(201).json({ sucesso: true, mensagem: 'Cliente cadastrado com sucesso!' });
    } catch (erro) {
        console.error('Erro ao cadastrar cliente:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao cadastrar cliente.' });
    }
});

module.exports = router;
