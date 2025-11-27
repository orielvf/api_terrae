const express = require('express');
const pool = require('../db');
const router = express.Router();

router.post('/', async (req, res) => {
    const { cliente_id } = req.body;

    if (!cliente_id) {
        return res.status(400).json({ sucesso: false, mensagem: 'cliente_id não fornecido.' });
    }

    try {
        // Pega o primeiro cliente com esse ID
        const cliente = await pool.query(
            `SELECT * FROM clientes WHERE id = $1 LIMIT 1`,
            [cliente_id]
        );

        if (cliente.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado.' });
        }

        // Atualiza o status para "ATIVO"
        await pool.query(
            `UPDATE clientes SET status = 'ATIVO' WHERE id = $1`,
            [cliente_id]
        );

        res.status(200).json({ sucesso: true, mensagem: 'Status do cliente atualizado para ATIVO.' });
    } catch (erro) {
        console.error('Erro ao promover cliente:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao promover cliente.' });
    }
});

module.exports = router;
