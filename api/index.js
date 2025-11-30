require('dotenv').config();
const express = require('express');
const cors = require('cors');

const loginHospedinRoutes = require('../routes/login_hospedin');
const relatorioRoutes = require('../routes/get_relatorio');

const app = express();

console.log("🔧 DATABASE_URL carregada?", !!process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());

// Aqui! Middleware para logar todas as requisições:
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    console.log('Body:', req.body);
    next();
});


app.use('/login_hospedin', loginHospedinRoutes);
app.use('/get_relatorio', relatorioRoutes);


app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');

});
