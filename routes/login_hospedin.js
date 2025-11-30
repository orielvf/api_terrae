const express = require('express');
const fetch = require('node-fetch');
const pool = require('../db'); // seu banco
const router = express.Router();

router.post('/', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            erro: "Email e senha são obrigatórios."
        });
    }

    try {
        // 1. Buscar authenticity_token
        const loginPage = await fetch("https://app.hospedin.com/users/sign_in");
        const html = await loginPage.text();

        const tokenMatch = html.match(/name="authenticity_token" value="([^"]+)"/);
        if (!tokenMatch) {
            return res.status(500).json({
                erro: "Não foi possível obter o authenticity_token."
            });
        }

        const authenticity_token = tokenMatch[1];

        // 2. Fazer login
        const resp = await fetch("https://app.hospedin.com/users/sign_in", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            redirect: "manual",
            body: new URLSearchParams({
                "authenticity_token": authenticity_token,
                "user[email]": email,
                "user[password]": password
            })
        });

        // 3. Pegar cookie
        const rawCookies = resp.headers.get("set-cookie");
        if (!rawCookies) {
            return res.status(401).json({ erro: "Login inválido." });
        }

        const sessionCookie = rawCookies.split(";")[0];

        // 4. Salvar no banco
        await pool.query(`
            INSERT INTO hospedin_session (id, session_cookie, updated_at)
            VALUES (1, $1, NOW())
            ON CONFLICT (id) DO UPDATE
            SET session_cookie = EXCLUDED.session_cookie,
                updated_at = NOW();
        `, [sessionCookie]);


        res.status(200).json({
            sucesso: true,
            cookie: sessionCookie
        });

    } catch (erro) {
        console.error("Erro no login:", erro);
        res.status(500).json({ erro: "Erro interno ao tentar logar na Hospedin." });
    }
});

module.exports = router;
