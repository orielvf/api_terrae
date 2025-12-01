const express = require('express');
const puppeteer = require('puppeteer');
const router = express.Router();

router.post('/teste_relatorio', async (req, res) => {
    const { email, password, url } = req.body;

    if (!email || !password || !url) {
        return res.status(400).json({ erro: "Envie email, password e url no body." });
    }

    let browser;

    try {
        browser = await puppeteer.launch({
            headless: false,
            ignoreHTTPSErrors: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-web-security",
                "--ignore-certificate-errors",
            ]
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1300, height: 900 });

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );

        console.log("🔵 Acessando login do PMS...");
        await page.goto("https://pms.hospedin.com/login", { waitUntil: "networkidle2" });

        // LOGIN
        await page.type('input[name="user[email]"]', email, { delay: 30 });
        await page.type('input[name="user[password]"]', password, { delay: 30 });

        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: "networkidle2" })
        ]);

        console.log("✅ Login realizado no PMS.");

        // Espera garantir carregamento completo
        await new Promise(r => setTimeout(r, 2000));

        console.log("🔵 Navegando para o relatório...");
        console.log("🌐 URL:", url);

        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 0
        });

        console.log("📄 Página carregada!");

        const html = await page.content();

        await browser.close();
        return res.status(200).send(html);

    } catch (erro) {
        if (browser) await browser.close();
        console.error("❌ Erro no Puppeteer:", erro);
        return res.status(500).json({ erro: "Erro ao buscar relatório." });
    }
});

module.exports = router;
