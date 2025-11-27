const express = require('express');
const pool = require('../db');
const router = express.Router();

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { usuario_id, nome, descricao, data_inicio, data_termino, quantidadeAleatoria } = req.body;

    console.log('--- Requisição recebida para atualizar campanha ---');
    console.log('Dados recebidos:', {
        id,
        usuario_id,
        nome,
        descricao,
        data_inicio,
        data_termino,
        quantidadeAleatoria
    });

    if (!id || !usuario_id) {
        console.error('Erro: ID da campanha ou do usuário não fornecido.');
        return res.status(400).json({ sucesso: false, mensagem: 'ID da campanha ou do usuário não fornecido.' });
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

        console.log('Campanha encontrada. Prosseguindo com a atualização...');

        await pool.query(
            `UPDATE campanhas
             SET nome = $1,
                 descricao = $2,
                 data_inicio = $3,
                 data_termino = $4,
                 quantidadeAleatoria = $5
             WHERE id = $6 AND usuario_id = $7`,
            [nome, descricao, data_inicio, data_termino, quantidadeAleatoria, id, usuario_id]
        );

        console.log(`[SUCESSO] Campanha atualizada com sucesso:`, {
            id,
            usuario_id,
            nome,
            descricao,
            data_inicio,
            data_termino,
            quantidadeAleatoria
        });

        res.status(200).json({ sucesso: true, mensagem: 'Campanha atualizada com sucesso.' });
    } catch (erro) {
        console.error('Erro ao atualizar campanha:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar campanha.' });
    }
});

module.exports = router;
