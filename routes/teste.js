const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    console.log('Recebido no webhook de teste:', req.body);
    res.json({ sucesso: true, mensagem: 'Webhook recebeu os dados com sucesso.' });
});

module.exports = router;
