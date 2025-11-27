// routes/cadastrarCampanha.js
const express = require('express');
const pool = require('../db'); // conexão com o banco (PostgreSQL)
const router = express.Router();

router.post('/', async (req, res) => {
    const { nome, descricao, data_inicio, data_termino, quantidadeAleatoria, usuario_id } = req.body;

    console.log('Requisição recebida:', req.body);

    if (!usuario_id || !nome || !data_inicio || !data_termino) {
        console.log('Erro: Dados obrigatórios ausentes');
        return res.status(400).json({ sucesso: false, mensagem: 'Dados obrigatórios ausentes.' });
    }

    try {
        console.log('Iniciando inserção da campanha no banco de dados...');

        const query = `
            INSERT INTO campanhas (nome, descricao, data_inicio, data_termino, quantidadeAleatoria, usuario_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const values = [
            nome,
            descricao,
            data_inicio,     // idealmente já em formato ISO string
            data_termino,
            quantidadeAleatoria,
            usuario_id
        ];

        const result = await pool.query(query, values);

        console.log('Campanha cadastrada com sucesso:', result.rows[0]);

        res.status(201).json({ sucesso: true, campanha: result.rows[0] });
    } catch (erro) {
        console.error('Erro ao cadastrar campanha:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao cadastrar campanha.' });
    }
});

module.exports = router;
