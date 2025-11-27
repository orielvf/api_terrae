const express = require('express');
const router = express.Router();
const pool = require('../db');
const fetch = require('node-fetch');

router.post('/', async (req, res) => {
    const { client_id, nome, telefone } = req.body;

    if (!client_id || !nome || !telefone) {
        return res.status(400).json({ sucesso: false, mensagem: 'client_id, nome e telefone são obrigatórios.' });
    }

    try {
        // Busca usuario_id do cliente
        const { rows: clientes } = await pool.query('SELECT usuario_id FROM clientes WHERE id = $1', [client_id]);
        if (clientes.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado.' });
        }
        const usuario_id = clientes[0].usuario_id;

        // Busca npswebhook do usuário
        const { rows: usuarios } = await pool.query('SELECT npswebhook FROM usuarios WHERE id = $1', [usuario_id]);
        if (usuarios.length === 0 || !usuarios[0].npswebhook) {
            return res.status(404).json({ sucesso: false, mensagem: 'Webhook não encontrado para este usuário.' });
        }
        const url = usuarios[0].npswebhook;

        // Envia POST para o webhook
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client_id, nome, telefone }),
        });

        // Atualiza pendente para true no cliente
        await pool.query('UPDATE clientes SET pendente = true WHERE id = $1', [client_id]);

        res.json({ sucesso: true, mensagem: 'Dados enviados e cliente atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro na rota de envio:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.' });
    }
});

module.exports = router;
