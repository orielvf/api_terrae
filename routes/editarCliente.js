const express = require('express');
const pool = require('../db');
const router = express.Router();

router.post('/', async (req, res) => {
    const { id, usuario_id, nome, email, telefone, descricao } = req.body;

    console.log('--- Requisição recebida para editar cliente ---');
    console.log('Dados recebidos:', {
        id,
        usuario_id,
        nome,
        email,
        telefone,
        descricao
    });

    if (!id || !usuario_id) {
        console.error('Erro: ID do cliente ou do usuário não fornecido.');
        return res.status(400).json({ sucesso: false, mensagem: 'ID do cliente ou do usuário não fornecido.' });
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

        console.log('Cliente encontrado. Prosseguindo com a atualização...');

        const resultadoAtualizacao = await pool.query(
            `UPDATE clientes
            SET nome = $1,
                email = $2,
                telefone = $3,
                descricao = $4
            WHERE id = $5 AND usuario_id = $6`,
            [nome, email, telefone, descricao, id, usuario_id]
        );

        console.log(`[SUCESSO] Cliente atualizado com sucesso:`, {
            id,
            usuario_id,
            nome,
            email,
            telefone,
            descricao
        });

        res.status(200).json({ sucesso: true, mensagem: 'Cliente atualizado com sucesso.' });
    } catch (erro) {
        console.error('Erro ao atualizar cliente:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar cliente.' });
    }
});

module.exports = router;
