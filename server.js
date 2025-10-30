// Substitua o conteúdo do seu server.js por este:

require('dotenv').config(); 
const express = require('express');
const session = require('express-session');
// const bodyParser = require('body-parser'); // <-- REMOVA ESTA LINHA
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
// Use os parsers NATIVOS do Express 5
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// ====================

// === CONFIGURAÇÃO METHOD OVERRIDE ===
// DEVE VIR *DEPOIS* do express.urlencoded
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