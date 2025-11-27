const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;

    console.log('Requisição recebida para listar campanhas do usuário:', usuario_id);

    if (!usuario_id) {
        console.log('Erro: ID do usuário não fornecido');
        return res.status(400).json({ sucesso: false, mensagem: 'ID do usuário não fornecido.' });
    }

    try {
        console.log('Buscando campanhas no banco de dados...');
        const result = await pool.query(
            'SELECT * FROM campanhas WHERE usuario_id = $1 AND ativo = TRUE',
            [usuario_id]
        );

        console.log('Campanhas encontradas:', result.rows);

        res.status(200).json({ sucesso: true, campanhas: result.rows });
    } catch (erro) {
        console.error('Erro ao buscar campanhas:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar campanhas.' });
    }
});

module.exports = router;
