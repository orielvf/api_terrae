const express = require('express');
const pool = require('../db');
const router = express.Router();

router.post('/', async (req, res) => {
    const { id, usuario_id } = req.body;

    console.log('--- Requisição recebida para desativar cliente ---');
    console.log('Dados recebidos:', { id, usuario_id });

    if (!id || !usuario_id) {
        console.error('Erro: ID do cliente ou do usuário não fornecido ou incorreto.');
        return res.status(400).json({ sucesso: false, mensagem: 'ID do cliente ou do usuário incorreto.' });
    }

    try {
        console.log(`Verificando existência do cliente [ID: ${id}] para o usuário [Usuario_ID: ${usuario_id}]...`);

        const clienteExistente = await pool.query(
            `SELECT * FROM clientes WHERE id = $1 AND usuario_id = $2`,
            [id, usuario_id]
        );

        if (clienteExistente.rows.length === 0) {
            console.warn(`Cliente não encontrado. ID: ${id}, Usuario_ID: ${usuario_id}`);
            return res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado.' });
        }

        console.log('Cliente encontrado. Desativando...');

        const resultadoAtualizacao = await pool.query(
            `UPDATE clientes
             SET ativo = false
             WHERE id = $1 AND usuario_id = $2`,
            [id, usuario_id]
        );

        console.log(`[SUCESSO] Cliente desativado: ID ${id}, Usuario_ID ${usuario_id}`);
        res.status(200).json({ sucesso: true, mensagem: 'Cliente desativado com sucesso.' });
    } catch (erro) {
        console.error('Erro ao desativar cliente:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao desativar cliente.' });
    }
});

module.exports = router;
