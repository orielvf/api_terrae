const express = require('express');
const axios = require('axios');
const pool = require('../db');
const router = express.Router();

router.post('/', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            erro: "Email e senha são obrigatórios."
        });
    }

    try {
        console.log("🔍 Buscando authenticity_token...");

        // 1. PEGAR PÁGINA DE LOGIN
        const loginPage = await axios.get("https://pms.hospedin.com/login", {
            responseType: "text",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "text/html"
            },
            validateStatus: () => true
        });

        const html = loginPage.data;

        // 2. EXTRAIR authenticity_token
        const tokenMatch = html.match(/name="authenticity_token" value="([^"]+)"/);

        if (!tokenMatch) {
            return res.status(500).json({
                erro: "Não foi possível obter o authenticity_token."
            });
        }

        const authenticity_token = tokenMatch[1];

        // 3. REALIZAR LOGIN + SEGUIR REDIRECIONAMENTOS
        const resp = await axios.post(
            "https://pms.hospedin.com/login",
            new URLSearchParams({
                "authenticity_token": authenticity_token,
                "user[email]": email,
                "user[password]": password
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "*/*"
                },
                maxRedirects: 5,
                validateStatus: () => true
            }
        );

        // 4. PEGAR COOKIE DE SESSÃO (após redirects)
        const rawCookies = resp.headers["set-cookie"];

        if (!rawCookies) {
            return res.status(401).json({ erro: "Login inválido." });
        }

        const sessionCookie = rawCookies[0].split(";")[0];

        // 5. SALVAR / SUBSTITUIR TOKEN SEMPRE
        await pool.query(`
            INSERT INTO hospedin_session (id, session_cookie, updated_at)
            VALUES (1, $1, NOW())
            ON CONFLICT (id) DO UPDATE
            SET session_cookie = EXCLUDED.session_cookie,
                updated_at = NOW();
        `, [sessionCookie]);

        return res.status(200).json({
            sucesso: true,
            cookie: sessionCookie
        });

    } catch (erro) {
        console.error("Erro no login:", erro);
        return res.status(500).json({ erro: "Erro interno ao tentar logar na Hospedin." });
    }
});

module.exports = router;
