const express = require('express');
const puppeteer = require('puppeteer');
const pool = require('../db');
const router = express.Router();

router.get('/relatorio', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ erro: "Envie a URL via query param: ?url=..." });

    try {
        // Buscar cookie de sessão no banco
        const result = await pool.query("SELECT session_cookie FROM hospedin_session WHERE id = 1");
        const sessionCookie = result.rows[0]?.session_cookie;
        if (!sessionCookie) return res.status(400).json({ erro: "Nenhum cookie salvo. Faça login primeiro." });

        // Iniciar Puppeteer ignorando erros de SSL
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']
        });
        const page = await browser.newPage();

        await page.setExtraHTTPHeaders({
            "User-Agent": "Mozilla/5.0",
            "Accept": "text/html"
        });

        // Aplicar cookie de sessão no domínio correto
        const [cookieName, cookieValue] = sessionCookie.split("=");
        await page.setCookie({
            name: cookieName,
            value: cookieValue,
            domain: "pms.hospedin.com",
            path: "/",
            httpOnly: true,
            secure: true
        });

        console.log("🔵 Navegando para:", url);
        await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

        // Pegar HTML da página
        const html = await page.content();
        await browser.close();

        console.log("✅ Relatório carregado com sucesso.");
        return res.status(200).send(html);

    } catch (erro) {
        console.error("❌ Erro ao buscar relatório com Puppeteer:", erro);
        return res.status(500).json({ erro: "Erro ao buscar relatório." });
    }
});

module.exports = router;
