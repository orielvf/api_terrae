const express = require('express');
const pool = require('../db');
const router = express.Router();

router.post('/', async (req, res) => {
    const { id, usuario_id } = req.body;

    console.log('--- Requisição recebida para desativar campanha ---');
    console.log('Dados recebidos:', { id, usuario_id });

    if (!id || !usuario_id) {
        console.error('Erro: ID da campanha ou do usuário não fornecido ou incorreto.');
        return res.status(400).json({ sucesso: false, mensagem: 'ID da campanha ou do usuário incorreto.' });
    }

    try {
        console.log(`Verificando existência da campanha [ID: ${id}] para o usuário [Usuario_ID: ${usuario_id}]...`);

        const campanhaExistente = await pool.query(
            `SELECT * FROM campanhas WHERE id = $1 AND usuario_id = $2`,
            [id, usuario_id]
        );

        if (campanhaExistente.rows.length === 0) {
            console.warn(`Campanha não encontrada. ID: ${id}, Usuario_ID: ${usuario_id}`);
            return res.status(404).json({ sucesso: false, mensagem: 'Campanha não encontrada.' });
        }

        console.log('Campanha encontrada. Desativando...');

        await pool.query(
            `UPDATE campanhas SET ativo = false WHERE id = $1 AND usuario_id = $2`,
            [id, usuario_id]
        );

        console.log(`[SUCESSO] Campanha desativada: ID ${id}, Usuario_ID ${usuario_id}`);
        res.status(200).json({ sucesso: true, mensagem: 'Campanha desativada com sucesso.' });
    } catch (erro) {
        console.error('Erro ao desativar campanha:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao desativar campanha.' });
    }
});

module.exports = router;