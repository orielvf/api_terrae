const express = require('express');
const router = express.Router();
const pool = require('../db');
const fetch = require('node-fetch');

function stringParaArray(texto) {
    if (!texto || texto.trim() === '') return [];
    return texto.split(',').map(id => id.trim());
}

function arrayParaString(arrayIds) {
    return arrayIds.join(',');
}

router.post('/', async (req, res) => {
    const { idCampanha } = req.body;
    console.log(`[POPULA CAMPANHA] Requisição recebida com idCampanha: ${idCampanha}`);

    if (!idCampanha) {
        console.log(`[POPULA CAMPANHA] Erro: idCampanha não enviado`);
        return res.status(400).json({ sucesso: false, mensagem: 'idCampanha é obrigatório.' });
    }

    try {
        console.log(`[POPULA CAMPANHA] Buscando campanha no banco...`);
        const { rows: campanhas } = await pool.query('SELECT * FROM campanhas WHERE id = $1', [idCampanha]);

        if (campanhas.length === 0) {
            console.log(`[POPULA CAMPANHA] Campanha ${idCampanha} não encontrada.`);
            return res.status(404).json({ sucesso: false, mensagem: 'Campanha não encontrada.' });
        }

        const campanha = campanhas[0];
        console.log(`[POPULA CAMPANHA] Campanha encontrada:`, campanha);

        let clientesRegistrados = stringParaArray(campanha.clientes_registrados);
        console.log(`[POPULA CAMPANHA] Clientes já registrados:`, clientesRegistrados);

        console.log(`[POPULA CAMPANHA] Buscando clientes disponíveis no banco...`);
        const { rows: clientesDisponiveis } = await pool.query(
            `SELECT * FROM clientes 
             WHERE usuario_id = $1 
             AND ativo = true 
             AND (pendente IS NOT TRUE) 
             AND (apoiador IS NOT TRUE) 
             AND (promotor IS NOT TRUE)
             AND (retrator IS NOT TRUE)
             AND NOT (id = ANY($2::int[]))`,
            [campanha.usuario_id, clientesRegistrados.map(id => parseInt(id))]
        );

        console.log(`[POPULA CAMPANHA] Clientes disponíveis encontrados:`, clientesDisponiveis);

        const totalDesejado = campanha.quantidadealeatoria || 0;
        const totalAtuais = clientesRegistrados.length;
        let novosClientes = [];

        console.log(`[POPULA CAMPANHA] Total desejado: ${totalDesejado}`);
        console.log(`[POPULA CAMPANHA] Total atuais: ${totalAtuais}`);

        for (const cliente of clientesDisponiveis) {
            if (totalAtuais + novosClientes.length >= totalDesejado) break;
            novosClientes.push(cliente.id.toString());
        }

        console.log(`[POPULA CAMPANHA] Novos clientes selecionados:`, novosClientes);

        clientesRegistrados = clientesRegistrados.concat(novosClientes);

        await pool.query(
            `UPDATE campanhas SET clientes_registrados = $1 WHERE id = $2`,
            [arrayParaString(clientesRegistrados), idCampanha]
        );

        console.log(`[POPULA CAMPANHA] Clientes registrados atualizados na campanha ${idCampanha}:`, clientesRegistrados);

        console.log(`[POPULA CAMPANHA] Chamando a rota rodarNPS...`);
        const resposta = await fetch("https://autenticador-email-production.up.railway.app/rodarCampanhaNPS", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idCampanha })
        });

        const resultado = await resposta.json();
        console.log(`[POPULA CAMPANHA] Resposta da rota rodarNPS:`, resultado);

        res.json({ sucesso: true, mensagem: 'Clientes registrados atualizados e NPS iniciado.', resultadoRodarNPS: resultado });

    } catch (erro) {
        console.error('[POPULA CAMPANHA] Erro:', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar clientes registrados.' });
    }
});

module.exports = router;
