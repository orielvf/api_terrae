const express = require('express');
const pool = require('../db');
const router = express.Router();

router.post('/', async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ sucesso: false, mensagem: 'ID do cliente não fornecido.' });
    }

    try {
        await pool.query(
            `UPDATE clientes SET promotor = true, pendente = false, apoiador = false WHERE id = $1`,
            [id]
        );

        res.status(200).json({ sucesso: true, mensagem: 'Cliente atualizado como Promotor.' });
    } catch (erro) {
        console.error('Erro ao atualizar cliente:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar cliente.' });
    }
});

module.exports = router;
