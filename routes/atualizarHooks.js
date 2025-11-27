const express = require('express');
const pool = require('../db');
const router = express.Router();

router.post('/', async (req, res) => {
    const { id, npswebhook, indicadorwebhook, indicadowebhook, promotorwebhook } = req.body;

    if (!id) {
        return res.status(400).json({ sucesso: false, mensagem: 'ID é obrigatório.' });
    }

    const campos = [];
    const valores = [];
    let contador = 1;

    if (npswebhook) {
        campos.push(`npswebhook = $${contador++}`);
        valores.push(npswebhook);
    }

    if (indicadorwebhook) {
        campos.push(`indicadorwebhook = $${contador++}`);
        valores.push(indicadorwebhook);
    }

    if (indicadowebhook) {
        campos.push(`indicadowebhook = $${contador++}`);
        valores.push(indicadowebhook);
    }

    if (promotorwebhook) {
        campos.push(`promotorwebhook = $${contador++}`);
        valores.push(promotorwebhook);
    }

    if (campos.length === 0) {
        return res.status(400).json({ sucesso: false, mensagem: 'Nenhum webhook informado para atualizar.' });
    }

    valores.push(id);

    const query = `
        UPDATE usuarios
        SET ${campos.join(', ')}
        WHERE id = $${contador}
        RETURNING id, npswebhook, indicadorwebhook, indicadowebhook, promotorwebhook
    `;

    try {
        const result = await pool.query(query, valores);

        if (result.rowCount === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
        }

        res.json({
            sucesso: true,
            mensagem: 'Webhooks atualizados com sucesso!',
            usuario: result.rows[0],
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar os webhooks.' });
    }
});

module.exports = router;
