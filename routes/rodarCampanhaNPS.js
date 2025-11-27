const express = require('express');
const router = express.Router();
const pool = require('../db');
const fetch = require('node-fetch');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

router.post('/', async (req, res) => {
    const { idCampanha } = req.body;
    if (!idCampanha) {
        return res.status(400).json({ sucesso: false, mensagem: 'idCampanha é obrigatório.' });
    }

    try {
        const { rows: campanhas } = await pool.query('SELECT * FROM campanhas WHERE id = $1', [idCampanha]);
        if (campanhas.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Campanha não encontrada.' });
        }

        const campanha = campanhas[0];
        const clientesIds = campanha.clientes_registrados
            ? campanha.clientes_registrados.split(',').map(id => id.trim())
            : [];

        if (clientesIds.length === 0) {
            return res.status(400).json({ sucesso: false, mensagem: 'Nenhum cliente registrado nesta campanha.' });
        }

        const { rows: usuarios } = await pool.query('SELECT npswebhook FROM usuarios WHERE id = $1', [campanha.usuario_id]);
        if (usuarios.length === 0 || !usuarios[0].npswebhook) {
            return res.status(404).json({ sucesso: false, mensagem: 'Webhook não encontrado para este usuário.' });
        }
        const webhook = usuarios[0].npswebhook;

        for (const clienteId of clientesIds) {
            const { rows: clientes } = await pool.query('SELECT id, nome, telefone FROM clientes WHERE id = $1', [clienteId]);
            if (clientes.length === 0) {
                console.log(`Cliente ${clienteId} não encontrado, pulando.`);
                continue;
            }
            const cliente = clientes[0];

            console.log(`Enviando dados do cliente ${cliente.id} para o webhook...`);

            await fetch(webhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_id: cliente.id, nome: cliente.nome, telefone: cliente.telefone }),
            });

            await pool.query('UPDATE clientes SET pendente = true WHERE id = $1', [cliente.id]);

            console.log(`Cliente ${cliente.id} enviado e atualizado.`);

            await delay(20000); // espera 20 segundos antes do próximo envio
        }

        res.json({ sucesso: true, mensagem: 'Todos os clientes da campanha foram processados.' });
    } catch (erro) {
        console.error('Erro na rota:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.' });
    }
});

module.exports = router;
