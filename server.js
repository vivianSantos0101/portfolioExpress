require('dotenv').config();
const express = require('express');
const session = require('express-session');
// const bodyParser = require('body-parser'); // <-- Remova esta linha
const path = require('path');
const methodOverride = require('method-override');
const routes = require('./routes/index');

const app = express();
const PORT = 3000;

// Configura o EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// === CORREÇÃO AQUI ===
// Substitua o 'bodyParser.urlencoded' pelo 'express.urlencoded' nativo
app.use(express.urlencoded({ extended: true }));
// Adicione também o 'express.json()' (boa prática)
app.use(express.json());
// ====================

// === CONFIGURAÇÃO METHOD OVERRIDE ===
// O MethodOverride DEVE vir DEPOIS do express.urlencoded
app.use(methodOverride('_method'));
// ===================================

// === CONFIGURAÇÃO DA SESSÃO ===
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));
// === FIM DA CONFIGURAÇÃO DA SESSÃO ===

// Usar as rotas (DEPOIS de todo o middleware)
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});