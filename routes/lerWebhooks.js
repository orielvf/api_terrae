const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ sucesso: false, mensagem: 'ID é obrigatório.' });
    }

    try {
        const result = await pool.query(
            'SELECT id, npswebhook, indicadorwebhook, indicadowebhook, promotorwebhook FROM usuarios WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
        }

        res.json({
            sucesso: true,
            usuario: result.rows[0],
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar os webhooks.' });
    }
});

module.exports = router;
