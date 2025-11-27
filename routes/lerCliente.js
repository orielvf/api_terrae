const express = require('express');
const pool = require('../db'); // conexão com o banco
const router = express.Router();

router.get('/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;

    console.log('Requisição recebida para listar clientes do usuário:', usuario_id);

    if (!usuario_id) {
        console.log('Erro: ID do usuário não fornecido');
        return res.status(400).json({ sucesso: false, mensagem: 'ID do usuário não fornecido.' });
    }

    try {
        console.log('Buscando clientes no banco de dados...');
        const result = await pool.query(
            'SELECT * FROM clientes WHERE usuario_id = $1 AND ativo = TRUE',
            [usuario_id]
        );

        console.log('Clientes encontrados:', result.rows);

        res.status(200).json({ sucesso: true, clientes: result.rows });
    } catch (erro) {
        console.error('Erro ao buscar clientes:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar clientes.' });
    }
});

module.exports = router;
