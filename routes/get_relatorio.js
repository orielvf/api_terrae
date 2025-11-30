const express = require('express');
const axios = require('axios');
const pool = require('../db');
const https = require('https');

const router = express.Router();

// 🔥 AGENTE SSL COM SNI CORRETO
const agent = new https.Agent({
    rejectUnauthorized: false,
    servername: "app.hospedin.com"
});

router.get('/relatorio', async (req, res) => {

    console.log("\n==============================");
    console.log("[🔵 GET] /relatorio (início)");
    console.log("Hora:", new Date().toISOString());
    console.log("==============================");

    const url = req.query.url;

    console.log("🔎 URL RECEBIDA NA ROTA:", url);

    if (!url) {
        return res.status(400).json({
            erro: "Envie a URL do relatório via query param: /relatorio?url=https%3A%2F%2F..."
        });
    }

    try {
        console.log("\n1️⃣ Buscando cookie salvo no banco...");

        const result = await pool.query(
            "SELECT session_cookie FROM hospedin_session WHERE id = 1"
        );

        if (result.rows.length === 0) {
            console.log("❌ Nenhum cookie encontrado.");
            return res.status(400).json({
                erro: "Nenhum cookie salvo. Faça login primeiro."
            });
        }

        const sessionCookie = result.rows[0].session_cookie;
        console.log("🍪 COOKIE ATUAL:", sessionCookie);

        console.log("\n2️⃣ Enviando requisição para a Hospedin...");
        console.log("➡️ URL chamada:", url);

        const response = await axios.get(url, {
            httpsAgent: agent,
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'text/html',
                'Cookie': sessionCookie   // <- CORRIGIDO AQUI
            },
            maxRedirects: 5,
            validateStatus: () => true
        });

        console.log("\n3️⃣ Resposta recebida:");
        console.log("📡 Status:", response.status);

        const redirectedUrl = response.request?.res?.responseUrl || "";
        console.log("🔁 URL final após redirects:", redirectedUrl);

        if (response.status === 401 || redirectedUrl.includes("login")) {
            console.log("❌ Sessão inválida");
            return res.status(401).json({
                erro: "Sessão inválida ou expirada. Faça login novamente."
            });
        }

        console.log("\n✅ Sucesso. Enviando HTML para o cliente.");
        return res.status(200).send(response.data);

    } catch (erro) {
        console.error("\n❌ ERRO AO BUSCAR RELATÓRIO:", erro);
        return res.status(500).json({
            erro: "Erro interno ao buscar relatório.",
            detalhe: erro.message
        });
    }
});

module.exports = router;
