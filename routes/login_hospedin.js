const express = require('express');
const axios = require('axios');
const pool = require('../db');
const router = express.Router();

router.post('/', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ erro: "Email e senha são obrigatórios." });
    }

    try {
        console.log("🔍 Buscando authenticity_token...");

        const loginPage = await axios.get("https://pms.hospedin.com/login", {
            responseType: "text",
            validateStatus: () => true
        });

        const html = loginPage.data;
        const tokenMatch = html.match(/name="authenticity_token" value="([^"]+)"/);

        if (!tokenMatch) {
            console.log("❌ HTML recebido:", html.slice(0, 500));
            return res.status(500).json({ erro: "Não foi possível obter authenticity_token." });
        }

        const authenticity_token = tokenMatch[1];
        console.log("🔑 Token encontrado:", authenticity_token);

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
                    "User-Agent": "Mozilla/5.0"
                },
                maxRedirects: 5,
                validateStatus: () => true
            }
        );

        const rawCookies = resp.headers["set-cookie"];
        if (!rawCookies || rawCookies.length === 0) {
            console.log("❌ Nenhum cookie retornado!");
            return res.status(401).json({ erro: "Login inválido." });
        }

        console.log("🍪 Cookies recebidos:", rawCookies);

        const sessionCookie = rawCookies.map(c => c.split(";")[0]).join("; ");
        console.log("📦 Cookie final montado:", sessionCookie);

        await pool.query(`
            INSERT INTO hospedin_session (id, session_cookie, updated_at)
            VALUES (1, $1, NOW())
            ON CONFLICT (id) DO UPDATE
            SET session_cookie = EXCLUDED.session_cookie,
                updated_at = NOW();
        `, [sessionCookie]);

        console.log("✅ Cookie salvo no banco.");

        return res.status(200).json({ sucesso: true, cookie: sessionCookie });

    } catch (erro) {
        console.error("🔥 Erro no login:", erro);
        return res.status(500).json({ erro: "Erro interno ao tentar logar na Hospedin." });
    }
});

module.exports = router;
